import { AppContext } from "@/context/AppContext";
import { ReactNode, useContext } from "react";
import { StyleSheet, Text } from "react-native";

export default function TextElement({
  children,
  style,
}: {
  style?: object;
  children: ReactNode;
}) {
  const appContext = useContext(AppContext);

  return (
    <Text
      style={{
        ...style,
        fontFamily: appContext.fontFamily,
        ...styles.defaultText,
      }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  defaultText: {},
});
