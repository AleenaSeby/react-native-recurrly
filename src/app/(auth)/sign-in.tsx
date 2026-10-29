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
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type MfaStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

const mfaLabels: Record<MfaStrategy, string> = {
  email_code: "Email code",
  phone_code: "Text message",
  totp: "Authenticator app",
  backup_code: "Backup code",
};

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  function getSupportedStrategies(): MfaStrategy[] {
    return (signIn.supportedSecondFactors ?? [])
      .map((factor) => factor.strategy)
      .filter(
        (strategy): strategy is MfaStrategy =>
          strategy === "email_code" ||
          strategy === "phone_code" ||
          strategy === "totp" ||
          strategy === "backup_code",
      );
  }

  const supportedStrategies = getSupportedStrategies();
  const isBusy = fetchStatus === "fetching" || isFinalizing;

  async function finalizeSignIn() {
    setIsFinalizing(true);
    setFormError(null);
    try {
      await signIn.finalize();
      posthog?.capture("user_signed_in");
      posthogLogger.info("Authentication sign-in completed", {
        flow: "authentication",
      });
      router.replace("/(tabs)");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsFinalizing(false);
    }
  }

  async function beginMfa(strategy: MfaStrategy) {
    setFormError(null);
    setVerificationCode("");
    try {
      if (strategy === "email_code") {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) {
          setFormError(getErrorMessage(error));
          return;
        }
      } else if (strategy === "phone_code") {
        const { error } = await signIn.mfa.sendPhoneCode();
        if (error) {
          setFormError(getErrorMessage(error));
          return;
        }
      }

      setMfaStrategy(strategy);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function submitCredentials() {
    const normalizedEmail = normalizeEmail(emailAddress);
    setFormError(null);

    if (!validateEmail(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setFormError("Enter your password to continue.");
      return;
    }

    setEmailAddress(normalizedEmail);
    try {
      const { error } = await signIn.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (signIn.status === "needs_client_trust") {
        if (getSupportedStrategies().includes("email_code")) {
          await beginMfa("email_code");
        } else {
          setFormError(
            "This sign-in needs an additional security check. Contact support to finish setting up your account.",
          );
        }
        return;
      }

      if (signIn.status === "needs_second_factor") {
        const strategies = getSupportedStrategies();
        if (strategies.length === 1) {
          await beginMfa(strategies[0]);
        } else if (strategies.length === 0) {
          setFormError(
            "This account requires an additional verification method that is not available. Contact support for help.",
          );
        }
        return;
      }

      setFormError(
        "We could not complete sign-in. Check your account settings or try again.",
      );
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function verifyMfa() {
    if (!mfaStrategy || !verificationCode.trim()) {
      setFormError("Enter your verification code.");
      return;
    }

    setFormError(null);
    try {
      let error: unknown;
      const code = verificationCode.trim();

      if (mfaStrategy === "email_code") {
        ({ error } = await signIn.mfa.verifyEmailCode({ code }));
      } else if (mfaStrategy === "phone_code") {
        ({ error } = await signIn.mfa.verifyPhoneCode({ code }));
      } else if (mfaStrategy === "totp") {
        ({ error } = await signIn.mfa.verifyTOTP({ code }));
      } else {
        ({ error } = await signIn.mfa.verifyBackupCode({ code }));
      }

      if (error) {
        setFormError(getErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
      } else {
        setFormError(
          "Another verification step is required. Choose an available method to continue.",
        );
        setMfaStrategy(null);
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const fieldErrors = errors.fields;
  const globalError = errors.global?.[0]?.message;

  return (
    <AuthScreen
      title={mfaStrategy ? "Verify it's you" : "Welcome back"}
      description={
        mfaStrategy
          ? `Complete ${mfaLabels[mfaStrategy].toLowerCase()} verification to continue.`
          : "Sign in to pick up where you left off."
      }
    >
      <View className="auth-card">
        {mfaStrategy ? (
          <View className="auth-form">
            <Text className="auth-helper">
              {mfaStrategy === "email_code" || mfaStrategy === "phone_code"
                ? "Enter the one-time code we sent you."
                : mfaStrategy === "totp"
                  ? "Enter the code from your authenticator app."
                  : "Enter one of your saved backup codes."}
            </Text>
            <AuthField
              label="Verification code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter your code"
              keyboardType={
                mfaStrategy === "backup_code" ? "default" : "number-pad"
              }
              autoCapitalize={
                mfaStrategy === "backup_code" ? "characters" : "none"
              }
              autoComplete="one-time-code"
              returnKeyType="go"
              onSubmitEditing={verifyMfa}
            />
            <AuthMessage message={formError ?? globalError} />
            <AuthButton
              label="Verify and continue"
              onPress={verifyMfa}
              loading={isBusy}
              disabled={isBusy}
            />
            {(mfaStrategy === "email_code" || mfaStrategy === "phone_code") && (
              <Pressable
                accessibilityRole="button"
                className="auth-secondary-button"
                disabled={isBusy}
                onPress={() => void beginMfa(mfaStrategy)}
              >
                <Text className="auth-secondary-button-text">
                  Send a new code
                </Text>
              </Pressable>
            )}
            {supportedStrategies.length > 1 && (
              <View className="auth-form">
                <Text className="auth-helper">Try another method</Text>
                {supportedStrategies
                  .filter((strategy) => strategy !== mfaStrategy)
                  .map((strategy) => (
                    <Pressable
                      key={strategy}
                      accessibilityRole="button"
                      className="auth-secondary-button"
                      disabled={isBusy}
                      onPress={() => void beginMfa(strategy)}
                    >
                      <Text className="auth-secondary-button-text">
                        {mfaLabels[strategy]}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            )}
          </View>
        ) : signIn.status === "needs_second_factor" ? (
          <View className="auth-form">
            <Text className="auth-helper">
              Choose a verification method for this account.
            </Text>
            <AuthMessage message={formError ?? globalError} />
            {supportedStrategies.map((strategy) => (
              <Pressable
                key={strategy}
                accessibilityRole="button"
                className="auth-secondary-button"
                disabled={isBusy}
                onPress={() => void beginMfa(strategy)}
              >
                <Text className="auth-secondary-button-text">
                  {mfaLabels[strategy]}
                </Text>
              </Pressable>
            ))}
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
                fieldErrors.identifier?.longMessage ??
                fieldErrors.identifier?.message
              }
            />
            <View>
              <AuthField
                label="Password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setFormError(null);
                }}
                placeholder="Your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submitCredentials}
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
              <View className="items-end">
                <Link href="/(auth)/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </View>
            </View>
            <AuthMessage message={formError ?? globalError} />
            <AuthButton
              label="Sign in"
              onPress={submitCredentials}
              loading={isBusy}
              disabled={isBusy}
            />
          </View>
        )}
      </View>
      <View className="auth-link-row">
        <Text className="auth-link-copy">New to Recurrly?</Text>
        <Link href="/(auth)/sign-up" className="auth-link">
          Create an account
        </Link>
      </View>
      <Text className="auth-trust-copy">
        Your subscriptions, ready when you are.
      </Text>
    </AuthScreen>
  );
}
