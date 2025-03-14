import { Button } from "react-native";

type Props = {
  title: string;
};

export default function ButtonSumbit({ title }: Props) {
  return (
    <>
      <Button title={title} color="#8EB5F0" />
    </>
  );
}
