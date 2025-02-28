import ButtonLink from "@/components/ButtonLink";

import { Text, View, StyleSheet } from "react-native";

export default function AccountLoginScreen() {
  return (
    <View>
      <Text style={styles.bigText}>UPDATING</Text>
      <ButtonLink text="HOME" href="/home/" />
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
