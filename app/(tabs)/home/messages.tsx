import { Text, View, StyleSheet } from "react-native";

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mensagens</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25003d",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#ffffff",
    fontSize: 20,
  },
});




