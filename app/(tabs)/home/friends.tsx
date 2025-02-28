import { Text, View, StyleSheet } from "react-native";

export default function FriendsScreen() {
  return (
    <View>
      <Text style={styles.bigText}>FRIENDS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
  },
});
