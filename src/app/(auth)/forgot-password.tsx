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
import { useSignIn } from "@clerk/expo";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type RecoveryStep = "email" | "code" | "password";

export default function ForgotPassword() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [step, setStep] = useState<RecoveryStep>("email");
  const [emailAddress, setEmailAddress] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const isBusy = fetchStatus === "fetching" || isFinalizing;

  async function requestResetCode() {
    const normalizedEmail = normalizeEmail(emailAddress);
    setFormError(null);

    if (!validateEmail(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    setEmailAddress(normalizedEmail);
    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
      if (createError) {
        setFormError(getErrorMessage(createError));
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setFormError(getErrorMessage(sendError));
        return;
      }

      setStep("code");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function verifyResetCode() {
    const code = verificationCode.trim();
    setFormError(null);
    if (!code) {
      setFormError("Enter the password reset code from your email.");
      return;
    }

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      if (signIn.status === "needs_new_password") {
        setStep("password");
      } else {
        setFormError(
          "We could not verify this reset request. Request a new code and try again.",
        );
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function submitNewPassword() {
    setFormError(null);
    if (password.length < 8) {
      setFormError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      if (signIn.status !== "complete") {
        setFormError(
          "Your password was not updated. Try again or contact support for help.",
        );
        return;
      }

      setIsFinalizing(true);
      await signIn.finalize();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsFinalizing(false);
    }
  }

  const fieldErrors = errors.fields;
  const globalError = errors.global?.[0]?.message;

  return (
    <AuthScreen
      title={
        step === "email"
          ? "Reset your password"
          : step === "code"
            ? "Check your inbox"
            : "Choose a new password"
      }
      description={
        step === "email"
          ? "We will send a secure reset code to your email address."
          : step === "code"
            ? `Enter the reset code sent to ${emailAddress}.`
            : "Choose a new password for your account."
      }
    >
      <View className="auth-card">
        <View className="auth-form">
          {step === "email" ? (
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
              returnKeyType="go"
              onSubmitEditing={requestResetCode}
              error={
                fieldErrors.identifier?.longMessage ??
                fieldErrors.identifier?.message
              }
            />
          ) : step === "code" ? (
            <AuthField
              label="Password reset code"
              value={verificationCode}
              onChangeText={(value) => {
                setVerificationCode(value);
                setFormError(null);
              }}
              placeholder="Enter your code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              returnKeyType="go"
              onSubmitEditing={verifyResetCode}
              error={
                fieldErrors.code?.longMessage ?? fieldErrors.code?.message
              }
            />
          ) : (
            <>
              <AuthField
                label="New password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setFormError(null);
                }}
                placeholder="Create a new password"
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
                label="Confirm new password"
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setFormError(null);
                }}
                placeholder="Enter your new password again"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
              />
            </>
          )}
          <AuthMessage message={formError ?? globalError} />
          <AuthButton
            label={
              step === "email"
                ? "Send reset code"
                : step === "code"
                  ? "Verify code"
                  : "Update password"
            }
            onPress={
              step === "email"
                ? requestResetCode
                : step === "code"
                  ? verifyResetCode
                  : submitNewPassword
            }
            loading={isBusy}
            disabled={isBusy}
          />
          {step === "code" && (
            <View className="flex-row items-center justify-center gap-1">
              <Text className="auth-helper">Didn&apos;t receive it?</Text>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={() => void requestResetCode()}
              >
                <Text className="auth-link">Send a new code</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <View className="auth-link-row">
        <Text className="auth-link-copy">Remember your password?</Text>
        <Link href="/(auth)/sign-in" className="auth-link">
          Back to sign in
        </Link>
      </View>
    </AuthScreen>
  );
}
