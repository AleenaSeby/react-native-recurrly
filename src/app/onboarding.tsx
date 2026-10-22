import { Link } from "expo-router";
import { Text, View } from "react-native";

const Onboarding = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-xl font-bold text-success">
            onboarding
        </Text>
         <Link href="/">Go Back</Link>
    </View>
  );
}
export default Onboarding;
