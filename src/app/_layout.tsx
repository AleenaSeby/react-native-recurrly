import "@/global.css";
import { SplashScreen, Stack } from "expo-router";
// Every file in app folder is a route. _layout.tsx files wrap the routes beside them.
import { useFonts } from "expo-font";
import { useEffect } from "react";
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular' : require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-medium' : require('../../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold' : require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-bold' : require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-extrabold' : require('../../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light' : require('../../assets/fonts/PlusJakartaSans-Light.ttf'),
  });
  // useEffect is used to hide the splash screen once the fonts are loaded.
  // SplashScreen.hideAsync() is called to hide the splash screen.
  // splash screen means the screen that is shown when the app is loading.
  // It is used to show a loading indicator while the app is loading.
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide the splash screen once the fonts are loaded
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Render nothing while fonts are loading
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
