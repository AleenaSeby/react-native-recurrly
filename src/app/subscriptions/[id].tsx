import { AuthLoadingScreen } from "@/components/auth/AuthUI";
import { useAuth } from "@clerk/expo";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Subscription Details : {id}
      </Text>
      <Link href="/">Go Back</Link>
    </View>
  );
};

export default SubscriptionDetails;