import { AuthLoadingScreen } from "@/components/auth/AuthUI";
import "@/global.css";
// (auth) is a special folder in the app directory that contains 
// authentication-related screens and components.
// why brackets? The brackets indicate that the folder is a "group" in the app directory,
// which means that it is not a route itself, but rather a container for other routes.
// This allows for better organization of the app's routes and components.
// The _layout.tsx file  under the (auth) folder is used to define the layout 
// and behavior of the authentication-related screens in the app.
import { useAuth } from "@clerk/expo";
// The useAuth hook is used to access the authentication state of the user.
// It provides information about whether the user is signed in,
// whether the authentication state is loaded, and the current user's information.
// It is used to conditionally render components based on the user's authentication state.
import { Redirect, Stack } from "expo-router";

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
