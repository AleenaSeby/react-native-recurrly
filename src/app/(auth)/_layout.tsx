import "@/global.css";
import { Stack } from "expo-router";
// Every file in app folder is a route. _layout.tsx files wrap the routes beside them.

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
