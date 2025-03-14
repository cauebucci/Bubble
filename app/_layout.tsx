import { AppContextProvider } from "@/context/AppContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AppContextProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppContextProvider>
  );
}
