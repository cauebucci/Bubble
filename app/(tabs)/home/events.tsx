import { Text, View, StyleSheet } from "react-native";

export default function EventsScreen() {
  return (
    <View>
      <Text style={styles.bigText}>EVENTS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
