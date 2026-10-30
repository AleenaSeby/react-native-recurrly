import SubscriptionCard from "@/components/SubscriptionCard";
import "@/global.css";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function SubscriptionItemSeparator() {
  return <View className="h-4" />;
}

export default function Subscriptions() {
  const { subscriptions, loadError } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscriptions;

    return subscriptions.filter((subscription) => {
      const searchableValues: (string | undefined)[] = [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.billing,
        subscription.status,
        subscription.paymentMethod,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(query),
      );
    });
  }, [searchQuery, subscriptions]);

  function toggleSubscription(subscriptionId: string) {
    setExpandedSubscriptionId((currentId) =>
      currentId === subscriptionId ? null : subscriptionId,
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
              ? "height"
              : undefined
        }
      >
        <FlatList
          data={filteredSubscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => toggleSubscription(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={SubscriptionItemSeparator}
          ListHeaderComponent={
            <View className="subscriptions-header">
              <Text className="subscriptions-title">My Subscriptions</Text>
              <Text className="subscriptions-description">
                Keep track of all your recurring plans.
              </Text>
              <View className="subscriptions-search">
                <TextInput
                  accessibilityLabel="Search subscriptions"
                  className="subscriptions-search-input"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search subscriptions"
                  placeholderTextColor="rgba(8, 17, 38, 0.5)"
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    className="subscriptions-search-clear"
                    onPress={() => setSearchQuery("")}
                    hitSlop={8}
                  >
                    <Text className="subscriptions-search-clear-text">×</Text>
                  </Pressable>
                )}
              </View>
              <View className="subscriptions-count-row">
                <Text className="subscriptions-count">
                  {searchQuery.trim()
                    ? `${filteredSubscriptions.length} ${
                        filteredSubscriptions.length === 1
                          ? "result"
                          : "results"
                      }`
                    : `${filteredSubscriptions.length} ${
                        filteredSubscriptions.length === 1
                          ? "subscription"
                          : "subscriptions"
                      }`}
                </Text>
              </View>
              {loadError ? (
                <Text className="auth-error mt-3">{loadError}</Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <Text className="home-empty-state">
              No subscriptions match “{searchQuery.trim()}”.
            </Text>
          }
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-30"
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
