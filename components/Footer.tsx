import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
};

export default function Footer({ title }: Props) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    height: "5%",
    // borderTopColor: "#8EB5F0",
    // borderTopWidth: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 1,
  },
  footerText: {
    color: "#dfdfdf",
    borderWidth: 1,
    borderColor: "yellow",
  },
});
