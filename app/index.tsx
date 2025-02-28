import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

import ButtonLink from "@/components/ButtonLink";

export default function Index() {
  return (
    <View>
      <Text style={styles.bigText}>SPLASH SCREEN</Text>
      <ButtonLink text="CREATE ACCOUNT" href="/account/create" />
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
