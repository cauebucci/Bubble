import { Text, View, StyleSheet } from "react-native";

export default function HomeIndexScreen() {
  return (
    <View>
      <Text style={styles.bigText}>HOME INDEX</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
