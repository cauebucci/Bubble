import { Text, View, StyleSheet, ImageBackground } from "react-native";

const placholderScreenPath = require("@/assets/images/placeholder/HOME.png");

export default function AccountLoginScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground style={styles.bg} source={placholderScreenPath}>
        <Text style={styles.bigText}>HOME INDEX</Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 20,
    color: "#fff",
  },
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
});
