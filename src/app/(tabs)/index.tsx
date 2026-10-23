import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreView } from "react-native-safe-area-context";
// why RNSafeAreView is used instead of SafeAreaView from react-native: 
// The SafeAreaView component from react-native-safe-area-context is a 
// more robust and flexible implementation of the SafeAreaView component 
// that is built into React Native. 
// It provides better support for different devices and screen sizes, 
// and it also allows for more customization and control over 
// the safe area insets.
const SafeAreaView = styled(RNSafeAreView);// The styled function from nativewind
// is used to create a styled version of the SafeAreaView component.

// SafeAreaView is used to render content within the safe area
//  boundaries of a device.
 // Home Page - which is a tab.
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-bold text-success font-sans-extrabold">
        Home
      </Text>
      <Link href="/onboarding" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Onboarding
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Sign Up
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Sign In
      </Link>
      <Link href="/subscriptions/spotify" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Spotify Subscription
      </Link>
      <Link  className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold"
       href={{
        pathname: "/subscriptions/[id]",
        params: { id: "netflix" },
      }}>
        Go to Netflix Subscription
      </Link>
    </SafeAreaView>
  );
}