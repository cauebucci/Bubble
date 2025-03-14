import { Text, StyleSheet, TextInput, View } from "react-native";
// import { Link } from "expo-router";

type Props = {
  label: string;
  alterLink?: string;
  placeholder?: string;
};

export default function Input({ label, alterLink, placeholder }: Props) {
  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.textInputLabel}>{label}:</Text>
      <TextInput style={styles.textInput} placeholder={placeholder} />
      {alterLink ? (
        <Text style={styles.textInputAlterLink}>{alterLink}</Text>
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInputContainer: {
    width: "80%",
    borderColor: "white",
    borderWidth: 1,
  },
  textInputLabel: {
    color: "#dfdfdf",
    borderColor: "red",
    borderWidth: 1,
  },
  textInputAlterLink: {
    color: "#dfdfdf",
    borderColor: "orange",
    borderWidth: 1,
    alignSelf: "center",
  },
  textInput: {
    backgroundColor: "#5a189a",
    color: "#dfdfdf",
    fontSize: 15,
    borderRadius: 5,
    height: 20,
    marginVertical: 10,
    width: "100%",
    borderColor: "cyan",
    borderWidth: 1,
  },
});
