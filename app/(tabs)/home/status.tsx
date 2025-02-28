import { Text, View, StyleSheet } from "react-native";

export default function StatusScreen() {
  return (
    <View>
      <Text style={styles.bigText}>STATUS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
