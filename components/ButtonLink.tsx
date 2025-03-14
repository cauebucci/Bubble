import { Text, StyleSheet, Animated } from "react-native";
import { Link } from "expo-router";

type Props = {
  href: string;
  text: string;
};

export default function ButtonLink({ href, text }: Props) {
  return (
    <>
      <Link href={href} style={styles.button}>
        <Text>{text}</Text>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    paddingHorizontal: 3,
    borderWidth: 5,
    borderColor: "#fff",
    color: "#fff",
  },
});
