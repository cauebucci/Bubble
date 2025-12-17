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
import { authAPI } from "@/services/api";
import { showError, showSuccess } from "@/utils/showAlert";

const logoPath = require("@/assets/images/logo-1.png");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      showError("Preencha todos os campos!");
      return;
    }

    try {
      setLoading(true);
      
      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValue = email.trim();
      
      if (!emailRegex.test(emailValue)) {
        showError("Por favor, insira um email válido.");
        setLoading(false);
        return;
      }
      
      console.log("Tentando fazer login com:", emailValue);
      
      const response = await authAPI.login({
        email: emailValue,
        pass: senha,
      });
      
      console.log("Login bem-sucedido:", response);
      
      showSuccess("Login realizado com sucesso!");
      
      // Pequeno delay para mostrar o alert de sucesso
      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 500);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Não foi possível fazer login. Verifique suas credenciais.";
      
      showError(errorMessage, "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
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

      {/* Campos de Login */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          editable={!loading}
        />

        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          editable={!loading}
        />

        {/* Link Esqueceu a senha */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Rodapé - Ajuda */}
      <View style={styles.footer}>
        <Text style={styles.helpText}>
          Esqueceu seus dados de login?{" "}
          <Text style={styles.helpLink}>Obtenha ajuda para entrar.</Text>
        </Text>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Link Cadastro */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não tem uma conta? </Text>
          <TouchableOpacity
            onPress={() => router.push("/account/create")}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.signupLink}>Cadastre-se.</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 30,
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
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "#ffffff",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#7db2ff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
  },
  helpText: {
    color: "#ffffff",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  helpLink: {
    fontWeight: "bold",
    color: "#7db2ff",
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#ffffff",
    opacity: 0.3,
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    color: "#ffffff",
    fontSize: 13,
  },
  signupLink: {
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 13,
  },
});
