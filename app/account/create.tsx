import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { userAPI, authAPI } from "@/services/api";
import { showError, showSuccess, showAlert } from "@/utils/showAlert";

const logoPath = require("@/assets/images/logo-1.png");

export default function AccountCreateScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async () => {
    // Validações
    if (!name || !username || !password || !email) {
      showError("Preencha todos os campos obrigatórios!");
      return;
    }

    if (password.length < 6) {
      showError("A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Por favor, insira um email válido!");
      return;
    }

    try {
      setLoading(true);
      
      // Criar usuário (telefone e username não são enviados na API atual)
      await userAPI.create({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      // Após criar, fazer login automaticamente
      await authAPI.login({
        email: email.trim(),
        pass: password,
      });

      showSuccess("Conta criada com sucesso!", "Sucesso", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]);
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      showError(
        error instanceof Error ? error.message : "Não foi possível criar a conta. Tente novamente.",
        "Erro ao criar conta"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, "");
    
    // Formata como +55(DDD)XXXX-XXXX
    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 4) return `+55(${numbers.slice(2)})`;
    if (numbers.length <= 8) return `+55(${numbers.slice(2, 4)})${numbers.slice(4)}`;
    return `+55(${numbers.slice(2, 4)})${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      {/* Seletor de Idioma */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.languageSelector}>
          <Text style={styles.languageText}>Português (Brasil)</Text>
          <Text style={styles.languageArrow}> ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={logoPath} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Título */}
      <Text style={styles.welcomeTitle}>Seja bem-vindo!</Text>
      
      {/* Texto de Instrução */}
      <Text style={styles.instructionText}>
        Cadastre-se abaixo inserindo as{" "}
        <Text style={styles.instructionTextBold}>seguintes informações:</Text>
      </Text>

      {/* Formulário de Cadastro */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Seu nome:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Fernando Souza"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          editable={!loading}
        />

        <Text style={styles.label}>Nome de usuário:</Text>
        <TextInput
          style={styles.input}
          placeholder="@nomeusuário"
          placeholderTextColor="#999"
          value={username}
          onChangeText={(text) => {
            // Garantir que comece com @
            const formatted = text.startsWith("@") ? text : `@${text}`;
            // Remover espaços e caracteres especiais
            const cleaned = formatted.replace(/[^@a-zA-Z0-9_]/g, "");
            setUsername(cleaned);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          editable={!loading}
        />

        <Text style={styles.label}>Crie uma senha:</Text>
        <TextInput
          style={styles.input}
          placeholder="************"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          editable={!loading}
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@gmail.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          editable={!loading}
        />

        <Text style={styles.label}>Telefone:</Text>
        <TextInput
          style={styles.input}
          placeholder="+55(DDD)XXXX-XXXX"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={(text) => setPhone(formatPhone(text))}
          keyboardType="phone-pad"
          returnKeyType="done"
          onSubmitEditing={handleCreateAccount}
          editable={!loading}
        />

        {/* Botão Continuar */}
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.continueButtonText}>Continuar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        {/* Separador */}
        <View style={styles.separator} />

        {/* Texto de Ajuda */}
        <Text style={styles.helpText}>
          Precisa de ajuda? <Text style={styles.helpTextBold}>Fale conosco!</Text>
        </Text>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25003d",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    color: "#ffffff",
    fontSize: 14,
  },
  languageArrow: {
    color: "#ffffff",
    fontSize: 12,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  instructionTextBold: {
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
    marginBottom: 40,
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#6a0dad",
    borderRadius: 10,
    padding: 15,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 0,
  },
  continueButton: {
    backgroundColor: "#7db2ff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    minHeight: 52,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#ffffff",
    opacity: 0.3,
    marginBottom: 20,
  },
  helpText: {
    color: "#ffffff",
    fontSize: 13,
    textAlign: "center",
  },
  helpTextBold: {
    fontWeight: "bold",
  },
});
