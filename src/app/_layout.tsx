import "@/global.css";
import { ClerkProvider, useUser } from "@clerk/expo";
 // The ClerkProvider component is a context provider that wraps 
 // the entire application and provides access to the
 // Clerk authentication state and methods.
 // It is required to use Clerk in a React Native application.
import { tokenCache } from "@clerk/expo/token-cache";
// The tokenCache is used to cache the authentication tokens 
// and reduce the number of network requests made to the Clerk API.
// It is recommended to use the tokenCache in production apps to improve performance and 
// reduce latency.
// open and close the app to see the effect of tokenCache on the authentication state.
import { posthog } from "@/lib/posthog";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router"; // The Stack component is used to create a
import { PostHogProvider } from "posthog-react-native";
//  stack navigator for the application. 
// It allows for navigation between different screens in the app 
// and provides a way to manage the navigation history.
import * as SplashScreen from "expo-splash-screen";
// The SplashScreen module is used to control the splash screen behavior in the app.
import { useEffect, useRef } from "react";

function getPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY before starting the app.",
    );
  }
  return key;
}

const publishableKey = getPublishableKey();

function PostHogScreenTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) posthog?.screen(pathname);
  }, [pathname]);

  return null;
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      identifiedUserId.current = null;
      return;
    }

    if (identifiedUserId.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName?.trim();

    posthog?.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return null;
}

// Keep the splash visible until we say so (runs before the first render)
SplashScreen.preventAutoHideAsync(); 
// The preventAutoHideAsync() method is called to keep the splash screen 
// visible until the app is ready to render. 
// This is useful for ensuring that the app does not show a 
// blank screen while loading resources such as fonts or authentication state.

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'sans-regular' : require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-medium' : require('../../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold' : require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-bold' : require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-extrabold' : require('../../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light' : require('../../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  useEffect(() => {
    if (fontError) console.error("Font loading failed:", fontError);
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Wait only while loading; if fonts fail, still show the app (system font)
  if (!fontsLoaded && !fontError) return null;

  const content = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>
          <PostHogScreenTracking />
          <PostHogIdentity />
          {content}
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}