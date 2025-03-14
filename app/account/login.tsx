import { View, StyleSheet, Text } from "react-native";

import Input from "@/components/Input";
import BubbleIcon from "@/components/BubbleIcon";
import Footer from "@/components/Footer";
import ButtonSumbit from "@/components/ButtonSubmit";

export default function AccountLoginScreen() {
  return (
    <View style={styles.viewContainer}>
      <Text style={styles.text}>Português (Brasil)</Text>
      <BubbleIcon width={300} height={300} />
      <Input label="Nome de usuário" placeholder="@exemplo" />
      <Input
        label="Senha"
        alterLink="Esqueceu a senha?"
        placeholder="***********"
      />
      <ButtonSumbit title="Entrar" />
      <Footer title="Não tem uma conta? Cadastre-se" />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontSize: 20,
  },
  viewContainer: {
    paddingTop: 20,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8%",
    backgroundColor: "#200243",
    borderColor: "coral",
    borderWidth: 1,
  },
});
