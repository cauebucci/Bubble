import { Text, View, StyleSheet } from "react-native";

export default function NotificationsScreen() {
  return (
    <View>
      <Text style={styles.bigText}>NOTIFICATIONS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
