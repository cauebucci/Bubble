import { AlertType } from "@/components/CustomAlert";

// Variável global para armazenar a função de alert
let globalShowAlert: ((options: {
  type?: AlertType;
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
}) => void) | null = null;

export const setGlobalAlert = (showAlert: typeof globalShowAlert) => {
  globalShowAlert = showAlert;
};

// Função helper para mostrar alertas (compatível com Alert.alert do React Native)
export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>,
  type: AlertType = "info"
) => {
  console.log("showAlert chamado:", title, message, "globalShowAlert:", !!globalShowAlert);
  
  if (!globalShowAlert) {
    // Fallback para Alert nativo se o contexto não estiver disponível
    console.warn("globalShowAlert não está disponível, usando Alert nativo");
    const { Alert } = require("react-native");
    Alert.alert(title, message, buttons);
    return;
  }

  // Determinar tipo baseado no título ou mensagem
  let alertType: AlertType = type;
  const titleLower = title.toLowerCase();
  const messageLower = (message || "").toLowerCase();

  if (titleLower.includes("sucesso") || titleLower.includes("success") || messageLower.includes("sucesso")) {
    alertType = "success";
  } else if (titleLower.includes("erro") || titleLower.includes("error") || messageLower.includes("erro")) {
    alertType = "error";
  } else if (titleLower.includes("aviso") || titleLower.includes("warning") || messageLower.includes("aviso")) {
    alertType = "warning";
  }

  try {
    globalShowAlert({
      type: alertType,
      title,
      message: message || "",
      buttons: buttons || [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
    });
  } catch (error) {
    console.error("Erro ao chamar globalShowAlert:", error);
    // Fallback para Alert nativo em caso de erro
    const { Alert } = require("react-native");
    Alert.alert(title, message, buttons);
  }
};

// Funções específicas por tipo
export const showSuccess = (
  message: string,
  title: string = "Sucesso",
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>
) => {
  showAlert(title, message, buttons, "success");
};

export const showError = (
  message: string,
  title: string = "Erro",
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>
) => {
  showAlert(title, message, buttons, "error");
};

export const showWarning = (
  message: string,
  title: string = "Aviso",
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>
) => {
  showAlert(title, message, buttons, "warning");
};

export const showInfo = (
  message: string,
  title: string = "Informação",
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>
) => {
  showAlert(title, message, buttons, "info");
};

