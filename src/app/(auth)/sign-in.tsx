import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-xl font-bold text-success">
            Sign In
        </Text>
        <Link href="/(auth)/sign-up" className="mt-4 rounded-lg bg-primary px-4 py-2">
            <Text className="text-lg font-semibold text-accent">
                Don't have an account? Sign Up
            </Text>
        </Link>
         <Link href="/">Go Back</Link>
    </View>
  );
}
export default SignIn;
