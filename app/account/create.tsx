import ButtonLink from "@/components/ButtonLink";

import { Text, View, StyleSheet } from "react-native";

export default function AccountCreateScreen() {
  return (
    <View>
      <Text style={styles.bigText}>CREATE ACCOUNT</Text>
      <ButtonLink text="LOGIN" href="/account/login" />
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
