import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { StyleSheet, TextInput, View } from "react-native";
import TextElement from "./TextElement";
// import { Link } from "expo-router";

type Props = {
  label: string;
  alterLink?: string;
  placeholder?: string;
};

export default function Input({ label, alterLink, placeholder }: Props) {
  const appContext = useContext(AppContext);
  const fontFamily = appContext?.fontFamily;

  return (
    <View style={styles.textInputContainer}>
      <TextElement style={{ fontFamily, ...styles.textInputLabel }}>
        {label}:
      </TextElement>
      <TextInput
        style={{ fontFamily, ...styles.textInput }}
        placeholder={placeholder}
        placeholderTextColor={styles.textInput.color}
        textAlign="center"
      />
      {alterLink ? (
        <TextElement style={{ fontFamily, ...styles.textInputAlterLink }}>
          {alterLink}
        </TextElement>
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInputContainer: {
    width: "90%",
    // borderColor: "white",
    // borderWidth: 1,
  },
  textInputLabel: {
    color: "#dfdfdf",
    fontSize: 18,
    // borderColor: "red",
    // borderWidth: 1,
  },
  textInput: {
    backgroundColor: "#5A189A",
    color: "#dfdfdf",
    fontSize: 18,
    borderRadius: 5,
    height: 40,
    marginVertical: 10,
    width: "100%",
    // borderColor: "cyan",
    // borderWidth: 1,
  },
  textInputAlterLink: {
    color: "#dfdfdf",
    alignSelf: "center",
    // borderColor: "orange",
    // borderWidth: 1,
  },
});
