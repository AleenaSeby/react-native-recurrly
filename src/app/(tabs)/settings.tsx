import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreView);
const Settings = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-xl font-bold text-success">
            Settings
        </Text>
    </SafeAreaView>
  );
}
export default Settings; 