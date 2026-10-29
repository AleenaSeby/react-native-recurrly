import {
  AuthButton,
  AuthField,
  AuthMessage,
  AuthScreen,
} from "@/components/auth/AuthUI";
import {
  getErrorMessage,
  normalizeEmail,
  validateEmail,
} from "@/lib/auth-validation";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { useSignUp } from "@clerk/expo";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type SignUpStep = "details" | "verification";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [step, setStep] = useState<SignUpStep>("details");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const isBusy = fetchStatus === "fetching" || isFinalizing;

  async function finalizeSignUp() {
    setIsFinalizing(true);
    setFormError(null);
    try {
      const { error } = await signUp.finalize();
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      posthog?.capture("user_signed_up");
      posthogLogger.info("Authentication sign-up completed", {
        flow: "authentication",
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsFinalizing(false);
    }
  }

  async function sendVerificationCode() {
    setFormError(null);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }
      setStep("verification");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function submitSignUp() {
    const normalizedEmail = normalizeEmail(emailAddress);
    setFormError(null);

    if (!validateEmail(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setFormError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }

    setEmailAddress(normalizedEmail);
    try {
      const { error } = await signUp.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      setStep("verification");
      await sendVerificationCode();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function verifyEmail() {
    const code = verificationCode.trim();
    setFormError(null);
    if (!code) {
      setFormError("Enter the verification code from your email.");
      return;
    }

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
      } else {
        setFormError(
          "Your account needs another verification step. Please contact support to complete setup.",
        );
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const fieldErrors = errors.fields;
  const globalError = errors.global?.[0]?.message;

  return (
    <AuthScreen
      title={step === "verification" ? "Check your inbox" : "Start fresh"}
      description={
        step === "verification"
          ? `Enter the code we sent to ${emailAddress}.`
          : "Create an account to bring every renewal into focus."
      }
    >
      <View className="auth-card">
        {step === "verification" ? (
          <View className="auth-form">
            <Text className="auth-helper">
              The code may take a moment to arrive. Check your spam folder if
              you do not see it.
            </Text>
            <AuthField
              label="Email verification code"
              value={verificationCode}
              onChangeText={(value) => {
                setVerificationCode(value);
                setFormError(null);
              }}
              placeholder="Enter your code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              returnKeyType="go"
              onSubmitEditing={verifyEmail}
              error={
                fieldErrors.code?.longMessage ?? fieldErrors.code?.message
              }
            />
            <AuthMessage message={formError ?? globalError} />
            <AuthButton
              label="Verify email"
              onPress={verifyEmail}
              loading={isBusy}
              disabled={isBusy}
            />
            <Pressable
              accessibilityRole="button"
              className="auth-secondary-button"
              disabled={isBusy}
              onPress={() => void sendVerificationCode()}
            >
              <Text className="auth-secondary-button-text">
                Send a new code
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="auth-form">
            <AuthField
              label="Email address"
              value={emailAddress}
              onChangeText={(value) => {
                setEmailAddress(value);
                setFormError(null);
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              error={
                fieldErrors.emailAddress?.longMessage ??
                fieldErrors.emailAddress?.message
              }
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setFormError(null);
              }}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              error={
                fieldErrors.password?.longMessage ??
                fieldErrors.password?.message
              }
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="auth-input-action"
                  onPress={() => setShowPassword((visible) => !visible)}
                >
                  <Text className="auth-input-action-text">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              }
            />
            <AuthField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setFormError(null);
              }}
              placeholder="Enter your password again"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="auth-input-action"
                  onPress={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                >
                  <Text className="auth-input-action-text">
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              }
            />
            <Text className="auth-helper">
              Use at least 8 characters. Your password is checked securely when
              you create your account.
            </Text>
            <AuthMessage message={formError ?? globalError} />
            <AuthButton
              label="Create account"
              onPress={submitSignUp}
              loading={isBusy}
              disabled={isBusy}
            />
            <View nativeID="clerk-captcha" />
          </View>
        )}
      </View>
      <View className="auth-link-row">
        <Text className="auth-link-copy">Already have an account?</Text>
        <Link href="/(auth)/sign-in" className="auth-link">
          Sign in
        </Link>
      </View>
      <Text className="auth-trust-copy">
        Simple, secure access to your subscription overview.
      </Text>
    </AuthScreen>
  );
}
