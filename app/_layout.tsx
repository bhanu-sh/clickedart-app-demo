import "@/global.css";

import { useAuthStore } from "@/store/useAuthStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function RootLayout() {
  // const { loadUser } = useAuthStore();

  useEffect(() => {
    // loadUser();
  }, []);
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
