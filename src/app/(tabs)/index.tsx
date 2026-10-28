import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreView } from "react-native-safe-area-context";
// why RNSafeAreView is used instead of SafeAreaView from react-native:
// The SafeAreaView component from react-native-safe-area-context is a
// more robust and flexible implementation of the SafeAreaView component
// that is built into React Native.
// It provides better support for different devices and screen sizes,
// and it also allows for more customization and control over
// the safe area insets.
const SafeAreaView = styled(RNSafeAreView); // The styled function from nativewind
// is used to create a styled version of the SafeAreaView component.

function SubscriptionItemSeparator() {
  return <View className="h-4" />;
}

// SafeAreaView is used to render content within the safe area
//  boundaries of a device.
// Home Page - which is a tab.
export default function App() {
  const { user } = useUser(); 
  // The useUser hook from @clerk/expo is used to access
  //  the current user's information. 
  // It provides access to the user's data, such as their name, email address,
  //  and profile picture.

  // The expandedSubscriptionId state is used to keep track of which
  // subscription card is currently expanded.
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const displayName =
    user?.firstName?.trim() ||
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Your account";
  const displayImage = user?.imageUrl?.trim() || null; // The displayName and displayImage variables are used to

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          // The ListHeaderComponent prop is used to render a
          // header component above the list of subscriptions.
          // In this case, it renders the user's avatar, name, total balance, and a list of upcoming subscriptions.

          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={displayImage ? { uri: displayImage } : images.avatar} className="home-avatar p-2" />
                <Text
                  className="home-user-name"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayName}
                </Text>
              </View>
              <Image source={icons.add} className="home-add-icon p-2" />
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Total Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>
            <View>
              <ListHeading title="Upcoming" />
              {/* <UpcomingSubscriptionCard data={UPCOMING_SUBSCRIPTIONS[0]} /> */}
              {/* FlatList is used to render a list of upcoming subscriptions.
         It takes in the UPCOMING_SUBSCRIPTIONS array as data 
         and renders each item using the UpcomingSubscriptionCard component. 
         The keyExtractor prop is used to extract a unique key for each item 
         in the list. */}
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals found.
                  </Text>
                }
              />
            </View>
            <ListHeading title="All Subscriptions" />
          </>
        }
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id} // Check if the current subscription is expanded
            onPress={() =>
              setExpandedSubscriptionId(
                expandedSubscriptionId === item.id ? null : item.id,
              )
            } // Toggle the expanded state.
            // If the current subscription is already expanded, set it to null (collapse it).
            // If it's not expanded, set it to the current subscription's id (expand it).
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId} // This prop is used to re-render the list when the expandedSubscriptionId state changes.
        ItemSeparatorComponent={SubscriptionItemSeparator} // This prop is used to render a separator between each item in the list.
        showsVerticalScrollIndicator={false} // This prop is used to hide the vertical scroll indicator.
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions found.</Text>
        }
        contentContainerClassName="pb-30"
      />
      {/* <Text className="text-3xl font-bold text-success font-sans-extrabold">
        Home
      </Text>
      <Link href="/onboarding" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Onboarding
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Sign Up
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Sign In
      </Link>
      <Link href="/subscriptions/spotify" className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold">
        Go to Spotify Subscription
      </Link>
      <Link  className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-sans-bold"
       href={{
        pathname: "/subscriptions/[id]",
        params: { id: "netflix" },
      }}>
        Go to Netflix Subscription
      </Link> */}
    </SafeAreaView>
  );
}
