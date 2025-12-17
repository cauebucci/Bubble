import { Text, View, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const splashIconPath = require("@/assets/images/splash-icon.png");

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Mostrar splash por pelo menos 2 segundos
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Verificar se o usuário está logado
        const userToken = await AsyncStorage.getItem("userToken");

        if (userToken) {
          // Usuário logado - redirecionar para home
          router.replace("/(tabs)/home");
        } else {
          // Usuário não logado - redirecionar para login
          router.replace("/account/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Em caso de erro, redirecionar para login
        router.replace("/account/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <LinearGradient
      colors={["#0d0019", "#25003d", "#6a0dad", "#9370db"]}
      style={styles.container}
      locations={[0, 0.3, 0.7, 1]}
    >
      <View style={styles.content}>
        {/* Texto "Bubble" */}
        <Text style={styles.title}>Bubble</Text>
        
        {/* Logo do Bubble */}
        <Image
          source={splashIconPath}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginTop: 10,
  },
  title: {
    fontSize: 85,
    color: "#ffffff",
    fontFamily: "CherryBombOne-Regular",
    letterSpacing: -1,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
});
