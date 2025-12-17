import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AlertProvider } from "@/contexts/AlertContext";

// Manter o splash screen visível enquanto carrega as fontes
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "CherryBombOne-Regular": require("@/assets/fonts/CherryBombOne-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Esconder o splash screen quando as fontes estiverem carregadas
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AlertProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AlertProvider>
  );
}
