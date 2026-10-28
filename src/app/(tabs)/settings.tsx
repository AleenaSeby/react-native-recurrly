import { AuthMessage } from "@/components/auth/AuthUI";
import { getErrorMessage } from "@/lib/auth-validation";
import { useAuth, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreView);
const Settings = () => {
  // signOut - A function that signs out the current user. 
  // Returns a promise that resolves when complete.
  const { signOut, isLoaded } = useAuth(); 
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);
    try {
      await signOut();
    } catch (signOutError) {
      setError(getErrorMessage(signOutError));
    } finally {
      setIsSigningOut(false);
    }
  }

  const displayName =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Your account";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="mt-4">
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          Your account and sign-in preferences.
        </Text>
      </View>
      <View className="auth-card mt-8">
        <Text className="auth-label">Signed in as</Text>
        <Text className="mt-2 text-lg font-sans-bold text-primary">
          {displayName}
        </Text>
        {user?.fullName ? (
          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        ) : null}
      </View>
      <View className="mt-6 gap-3">
        <AuthMessage message={error} />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: !isLoaded || isSigningOut,
            busy: isSigningOut,
          }}
          className="account-signout"
          disabled={!isLoaded || isSigningOut}
          onPress={() => void handleSignOut()}
        >
          <Text className="account-signout-text">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;