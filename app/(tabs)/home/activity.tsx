import { Text, View, StyleSheet } from "react-native";

export default function FriendsActivityScreen() {
  return (
    <View>
      <Text style={styles.bigText}>ACTIVITY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
