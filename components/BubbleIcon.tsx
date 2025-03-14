import { Image, StyleSheet } from "react-native";

type Props = {
  height?: number;
  width?: number;
};

const bubbleIconPath = require("@/assets/images/bubble-icon.png");

export default function BubbleIcon({ height, width }: Props) {
  return (
    <Image
      style={{ width, height, ...styles.bubbleIcon }}
      source={bubbleIconPath}
    ></Image>
  );
}

const styles = StyleSheet.create({
  bubbleIcon: {
    // borderColor: "pink",
    // borderWidth: 1,
  },
});
