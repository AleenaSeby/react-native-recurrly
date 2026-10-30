import {
  getSubscriptions,
  getSubscriptionsSnapshot,
  subscribeToSubscriptions,
} from "@/lib/subscriptions-store";
import { useEffect, useState, useSyncExternalStore } from "react";

export function useSubscriptions() {
  const subscriptions = useSyncExternalStore(
    subscribeToSubscriptions,
    getSubscriptionsSnapshot,
    getSubscriptionsSnapshot,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getSubscriptions().then(
      () => {
        if (isMounted) setLoadError(null);
      },
      (error: unknown) => {
        console.error("Subscriptions could not be loaded:", error);
        if (isMounted) {
          setLoadError("Subscriptions could not be loaded. Please try again.");
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  return { subscriptions, loadError };
}
