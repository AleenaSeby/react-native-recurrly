import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignUp = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-xl font-bold text-success">
            Sign Up
        </Text>
        <Link href="/(auth)/sign-in" className="mt-4 rounded-lg bg-primary px-4 py-2">
            <Text className="text-lg font-semibold text-accent">
                Already have an account? Sign In
            </Text>
        </Link>
         <Link href="/">Go Back</Link>
    </View>
  );
}
export default SignUp;
