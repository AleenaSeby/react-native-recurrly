import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof categories)[number];
type Frequency = "Monthly" | "Yearly";

const categoryColors: Record<Category, string> = {
  Entertainment: "#e8def8",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#d9e7c5",
  Design: "#f5c542",
  Productivity: "#f2c9b8",
  Cloud: "#c5d9f1",
  Music: "#b8e8d0",
  Other: colors.card,
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => Promise<void>;
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const parsedPrice = Number(price.trim());
  const hasValidPrecision = /^\d+(?:\.\d{1,2})?$/.test(price.trim());
  const isFormValid =
    name.trim().length > 0 &&
    hasValidPrecision &&
    Number.isFinite(parsedPrice) &&
    parsedPrice > 0;

  function resetForm() {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setFormError(null);
  }

  function closeModal() {
    resetForm();
    onClose();
  }

  async function submitSubscription() {
    const trimmedName = name.trim();
    const numericPrice = parsedPrice;

    if (!trimmedName) {
      setFormError("Enter a name for this subscription.");
      return;
    }

    if (
      !hasValidPrecision ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setFormError("Enter a price greater than zero with up to two decimals.");
      return;
    }

    const startDate = dayjs();
    const renewalDate = startDate
      .add(1, frequency === "Monthly" ? "month" : "year")
      .toISOString();
    const subscription: Subscription = {
      id: `subscription-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      price: numericPrice,
      currency: "USD",
      frequency,
      billing: frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate,
      icon: icons.plus,
      color: categoryColors[category],
    };

    setIsSaving(true);
    setFormError(null);
    try {
      await onCreate(subscription);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Subscription could not be saved:", error);
      setFormError("Subscription could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View className="modal-overlay">
        <KeyboardAvoidingView
          className="modal-keyboard-avoider"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close new subscription form"
            className="modal-backdrop"
            onPress={closeModal}
          />

          <View className="modal-container" style={{ height: "85%" }}>
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                className="modal-close"
                onPress={closeModal}
                hitSlop={8}
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>
            <ScrollView
              className="modal-form-scroll"
              contentContainerClassName="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  accessibilityLabel="Subscription name"
                  className="auth-input"
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setFormError(null);
                  }}
                  placeholder="e.g. Spotify Premium"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  accessibilityLabel="Subscription price"
                  className="auth-input"
                  value={price}
                  onChangeText={(value) => {
                    setPrice(value);
                    setFormError(null);
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => {
                    const isSelected = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        className={clsx(
                          "picker-option",
                          isSelected && "picker-option-active",
                        )}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            isSelected && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {categories.map((option) => {
                    const isSelected = category === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        className={clsx(
                          "category-chip",
                          isSelected && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isSelected && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {formError ? (
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                  className="auth-error"
                >
                  {formError}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create subscription"
                className={clsx(
                  "auth-button",
                  (!isFormValid || isSaving) && "auth-button-disabled",
                )}
                disabled={!isFormValid || isSaving}
                onPress={() => void submitSubscription()}
              >
                <Text className="auth-button-text">
                  {isSaving ? "Saving..." : "Add Subscription"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
