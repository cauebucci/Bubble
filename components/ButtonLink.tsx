import { StyleSheet } from "react-native";
import { Link } from "expo-router";
import TextElement from "./TextElement";

type Props = {
  href: string;
  text: string;
};

export default function ButtonLink({ href, text }: Props) {
  return (
    <>
      <Link href={href} style={styles.button}>
        <TextElement>{text}</TextElement>
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
