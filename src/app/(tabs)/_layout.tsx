import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import clsx from "clsx"; // Import the clsx library for conditional class names
import { Tabs } from "expo-router";
import { Image, View } from "react-native";
// Import the useSafeAreaInsets hook to get safe area insets for proper layout
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { tabBar } = components;
const TabsLayout = () => {
    const insets = useSafeAreaInsets();// Get the safe area insets for proper layout
    const TabIcon = ({ focused, icon }: TableIconProps) => (
        <View className="tabs-icon">
            <View className={clsx("tabs-pill", focused && "tabs-active")}>
                <Image source={icon} className="tabs-glyph" />
            </View>
        </View>
    );
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                position: "absolute",
                bottom: Math.max(insets.bottom, tabBar.height),
                height: tabBar.height,
                borderRadius: tabBar.radius,
                marginHorizontal: tabBar.horizontalInset,
                backgroundColor: colors.primary,
                shadowColor: colors.foreground,
                borderTopWidth: 0,
                elevation: 0,
            },
            tabBarItemStyle: {
                paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
            },
            tabBarIconStyle: {
                width: tabBar.iconFrame,
                height: tabBar.iconFrame,
                alignItems: "center",
                justifyContent: "center",
            },
        }}>
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={tab.icon} />
                        )
                    }}
                />
            ))}
            {/* <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
        <Tabs.Screen name="insights" options={{ title: "Insights" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} /> */}

        </Tabs>
    )
}
export default TabsLayout;