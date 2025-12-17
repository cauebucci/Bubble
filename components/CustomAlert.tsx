import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";

export type AlertType = "success" | "error" | "warning" | "info";

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  buttons,
  onClose,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "✓",
          backgroundColor: "#4CAF50",
          iconBackground: "#2E7D32",
          borderColor: "#66BB6A",
        };
      case "error":
        return {
          icon: "✕",
          backgroundColor: "#F44336",
          iconBackground: "#C62828",
          borderColor: "#EF5350",
        };
      case "warning":
        return {
          icon: "⚠",
          backgroundColor: "#FF9800",
          iconBackground: "#F57C00",
          borderColor: "#FFB74D",
        };
      case "info":
        return {
          icon: "ℹ",
          backgroundColor: "#2196F3",
          iconBackground: "#1565C0",
          borderColor: "#64B5F6",
        };
      default:
        return {
          icon: "ℹ",
          backgroundColor: "#2196F3",
          iconBackground: "#1565C0",
          borderColor: "#64B5F6",
        };
    }
  };

  const config = getTypeConfig();

  const defaultButtons = buttons || [
    {
      text: "OK",
      onPress: onClose,
      style: "default" as const,
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlayContainer} pointerEvents={visible ? "auto" : "none"}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable
            style={styles.overlayTouchable}
            onPress={onClose}
            disabled={!visible}
          />
          <View style={styles.alertWrapper} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
              pointerEvents="auto"
            >
          <View style={[styles.iconContainer, { backgroundColor: config.iconBackground }]}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {defaultButtons.map((button, index) => {
              const isDestructive = button.style === "destructive";
              const isCancel = button.style === "cancel";
              const isLast = index === defaultButtons.length - 1;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isLast && defaultButtons.length > 1 && styles.buttonLast,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                  ]}
                  onPress={() => {
                    button.onPress();
                    if (!isCancel) {
                      onClose();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && styles.buttonTextCancel,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
        </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  alertWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6a0dad",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  icon: {
    fontSize: 36,
    color: "#ffffff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#cccccc",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#7db2ff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#6a0dad",
  },
  buttonLast: {
    marginLeft: 0,
  },
  buttonDestructive: {
    backgroundColor: "#F44336",
    borderColor: "#C62828",
  },
  buttonCancel: {
    backgroundColor: "#6a0dad",
    borderColor: "#7db2ff",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDestructive: {
    color: "#ffffff",
  },
  buttonTextCancel: {
    color: "#ffffff",
  },
});

export default CustomAlert;

