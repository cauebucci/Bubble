import ButtonLink from "@/components/ButtonLink";

import { Text, View, StyleSheet, ImageBackground } from "react-native";

const placholderScreenPath = require("@/assets/images/placeholder/CADASTRO.png");

export default function AccountCreateScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground style={styles.bg} source={placholderScreenPath}>
        <Text style={styles.bigText}>CREATE ACCOUNT</Text>
        <ButtonLink text="LOGIN" href="/account/login" />
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
