import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const subscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id: string}>(); 
    // Get the subscription ID from the URL parameters
    // You can use this ID to fetch subscription details from your backend or API
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Subscription Details : {id}
      </Text>
      <Link href="/">Go Back</Link>
    </View>
  );
}

export default subscriptionDetails;