import AsyncStorage from "@react-native-async-storage/async-storage";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

const STORAGE_KEY = "@recurrly/subscriptions";

let subscriptionsSnapshot = HOME_SUBSCRIPTIONS;
let isHydrated = false;
let loadPromise: Promise<Subscription[]> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();

function isSubscription(value: unknown): value is Subscription {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.price === "number" &&
    (typeof record.icon === "number" ||
      (typeof record.icon === "object" && record.icon !== null)) &&
    typeof record.billing === "string"
  );
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getSubscriptionsSnapshot() {
  return subscriptionsSnapshot;
}

export function subscribeToSubscriptions(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSubscriptions(): Promise<Subscription[]> {
  if (isHydrated) return Promise.resolve(subscriptionsSnapshot);
  if (loadPromise) return loadPromise;

  loadPromise = AsyncStorage.getItem(STORAGE_KEY)
    .then((storedSubscriptions) => {
      if (storedSubscriptions !== null) {
        const parsed: unknown = JSON.parse(storedSubscriptions);
        if (!Array.isArray(parsed) || !parsed.every(isSubscription)) {
          throw new Error("Stored subscriptions data is invalid.");
        }
        subscriptionsSnapshot = parsed;
      } else {
        subscriptionsSnapshot = HOME_SUBSCRIPTIONS;
      }

      isHydrated = true;
      notifyListeners();
      return subscriptionsSnapshot;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export function addSubscription(subscription: Subscription): Promise<void> {
  const persist = async () => {
    const currentSubscriptions = await getSubscriptions();
    const nextSubscriptions = [subscription, ...currentSubscriptions];

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextSubscriptions),
    );

    subscriptionsSnapshot = nextSubscriptions;
    isHydrated = true;
    notifyListeners();
  };

  const operation = writeQueue.then(persist, persist);
  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}
