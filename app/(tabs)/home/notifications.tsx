import { Text, View, StyleSheet } from "react-native";

export default function AccountLoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bigText}>NOTIFICATIONS</Text>
        <Text style={styles.developmentText}>🚧 Em desenvolvimento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bigText: {
    fontSize: 20,
    color: "#fff",
  },
  developmentText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    fontWeight: "500",
  },
});
