import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import CustomAlert, { AlertType } from "@/components/CustomAlert";
import { setGlobalAlert } from "@/utils/showAlert";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertContextType {
  showAlert: (options: {
    type?: AlertType;
    title?: string;
    message: string;
    buttons?: AlertButton[];
  }) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = useCallback(
    (options: {
      type?: AlertType;
      title?: string;
      message: string;
      buttons?: AlertButton[];
    }) => {
      const {
        type = "info",
        title = type === "success"
          ? "Sucesso"
          : type === "error"
          ? "Erro"
          : type === "warning"
          ? "Aviso"
          : "Informação",
        message,
        buttons,
      } = options;

      const defaultButtons: AlertButton[] = buttons || [
        {
          text: "OK",
          onPress: () => {},
        },
      ];

      setAlertState({
        visible: true,
        type,
        title,
        message,
        buttons: defaultButtons,
      });
    },
    []
  );

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  // Registrar a função global para uso em qualquer lugar
  useEffect(() => {
    setGlobalAlert((options) => {
      showAlert(options);
    });
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons.map((btn) => ({
          text: btn.text,
          onPress: () => {
            if (btn.onPress) {
              btn.onPress();
            }
            hideAlert();
          },
          style: btn.style,
        }))}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

