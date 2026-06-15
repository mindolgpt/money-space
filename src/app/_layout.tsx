import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../features/auth";
import { router } from "expo-router";
import { pushPendingChanges, subscribeToRealtime } from "../features/sync-engine";
import { SYNC_INTERVAL_MS } from "../shared/config/constants";

export default function RootLayout() {
  const { restoreSession, user, isLoading } = useAuthStore();
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (user) {
      subscribeToRealtime();
      pushPendingChanges();
      syncIntervalRef.current = setInterval(() => {
        pushPendingChanges();
      }, SYNC_INTERVAL_MS);
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [user, isLoading]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
