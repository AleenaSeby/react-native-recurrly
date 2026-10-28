import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import { styled } from "nativewind";
import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthScreenProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function AuthScreen({
  title,
  description,
  children,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[440px] self-center">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">r</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">recurrly</Text>
                  <Text className="auth-wordmark-sub">
                    SUBSCRIPTION CLARITY
                  </Text>
                </View>
              </View>
              <Text className="auth-title">{title}</Text>
              <Text className="auth-subtitle">{description}</Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
};

export function AuthField({
  label,
  error,
  hint,
  trailing,
  ...inputProps
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View
        className={clsx("auth-input-wrap", error && "auth-input-wrap-error")}
      >
        <TextInput
          {...inputProps}
          className="auth-input-control"
          accessibilityLabel={label}
          placeholderTextColor={colors.mutedForeground}
          autoCorrect={false}
          selectionColor={colors.accent}
        />
        {trailing}
      </View>
      {hint ? <Text className="auth-helper">{hint}</Text> : null}
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="auth-error"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={clsx("auth-button", isDisabled && "auth-button-disabled")}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text className="auth-button-text">{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthMessage({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="auth-error"
    >
      {message}
    </Text>
  );
}

export function AuthLoadingScreen() {
  return (
    <SafeAreaView className="auth-safe-area items-center justify-center">
      <ActivityIndicator color={colors.accent} size="large" />
      <Text className="auth-helper mt-4">Preparing your account...</Text>
    </SafeAreaView>
  );
}
