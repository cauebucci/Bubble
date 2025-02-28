import { Text, View, StyleSheet, ImageBackground } from "react-native";

import ButtonLink from "@/components/ButtonLink";

const splashScreenPath = require("@/assets/images/placeholder/SPLASH-SCREEN.png");

export default function Index() {
  return (
    <View style={styles.container}>
      <ImageBackground style={styles.bg} source={splashScreenPath}>
        <Text style={styles.bigText}>SPLASH SCREEN</Text>
        <Text style={styles.bigText}>DIFF TEXT</Text>
        <ButtonLink text="CREATE ACCOUNT" href="/account/create" />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
    color: "#fff",
  },
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
});
