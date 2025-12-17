import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";

interface ProbabilityModalProps {
  visible: boolean;
  eventName: string;
  eventAddress: string;
  eventIcon?: string;
  onClose: () => void;
  onConfirm: (probability: number) => Promise<void>;
}

export default function ProbabilityModal({
  visible,
  eventName,
  eventAddress,
  eventIcon = "🎉",
  onClose,
  onConfirm,
}: ProbabilityModalProps) {
  const [probability, setProbability] = useState(50);
  const [loading, setLoading] = useState(false);

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!visible) {
      setProbability(50);
      setLoading(false);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (loading) return; // Evitar múltiplas submissões
    setLoading(true);
    try {
      await onConfirm(Math.round(probability));
      // Não fechar aqui, deixar o componente pai fechar
      // O loading será resetado quando o modal fechar (useEffect)
    } catch (error) {
      console.error("Erro ao confirmar probabilidade:", error);
      // O erro será tratado pelo componente pai
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Não permitir fechar durante o loading
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        disabled={loading || !visible}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContainer}
        >
          {/* Ícone no topo */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{eventIcon}</Text>
            </View>
          </View>

          {/* Título do evento */}
          <Text style={styles.eventTitle}>{eventName}</Text>

          {/* Campo de localização */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationName}>{eventAddress.split(",")[0]}</Text>
            <Text style={styles.locationAddress}>{eventAddress}</Text>
          </View>

          {/* Slider de probabilidade */}
          <View style={styles.sliderContainer}>
            {/* Ícone de mão à esquerda */}
            <View style={styles.dragHintContainer}>
              <Text style={styles.dragHand}>👉</Text>
              <Text style={styles.dragText}>Arraste</Text>
            </View>

            {/* Slider no meio */}
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={probability}
                onValueChange={setProbability}
                minimumTrackTintColor="#7db2ff"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor={Platform.OS === "ios" ? "#7db2ff" : "#7db2ff"}
              />
            </View>

            {/* Texto de probabilidade à direita */}
            <View style={styles.probabilityTextContainer}>
              <Text style={styles.probabilityLabel}>Chances de você ir:</Text>
              <Text style={styles.probabilityValue}>{Math.round(probability)}%</Text>
            </View>
          </View>

          {/* Botões de ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Enviar!</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#6a0dad",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7db2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 32,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  locationContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: "#666666",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dragHintContainer: {
    alignItems: "center",
    marginRight: 8,
    minWidth: 60,
  },
  dragHand: {
    fontSize: 28,
    marginBottom: 4,
  },
  dragText: {
    fontSize: 12,
    color: "#FFD700",
    fontWeight: "600",
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  probabilityTextContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
    minWidth: 100,
  },
  probabilityLabel: {
    fontSize: 12,
    color: "#ffffff",
    marginBottom: 4,
    textAlign: "right",
  },
  probabilityValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6a0dad",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 70,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#6a0dad",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#7db2ff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

