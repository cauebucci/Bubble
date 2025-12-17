import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { SearchResult } from "@/services/places";

interface ConfirmEventModalProps {
  visible: boolean;
  eventType: string;
  eventLabel: string;
  eventIcon: string;
  place: SearchResult | null;
  onClose: () => void;
  onConfirm: (eventName: string) => void;
}

export default function ConfirmEventModal({
  visible,
  eventType,
  eventLabel,
  eventIcon,
  place,
  onClose,
  onConfirm,
}: ConfirmEventModalProps) {
  const [eventName, setEventName] = useState("");

  const handleConfirm = () => {
    if (!eventName.trim()) {
      // Se não tiver nome, usar o padrão
      onConfirm(`${eventLabel} - ${place?.name || ""}`);
    } else {
      onConfirm(eventName.trim());
    }
    setEventName(""); // Reset para próximo uso
  };

  if (!place) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Icon */}
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIconText}>{eventIcon}</Text>
            </View>
          </View>

          {/* Event Label */}
          <Text style={styles.eventLabel}>{eventLabel}</Text>

          {/* Place Info */}
          <View style={styles.placeInfoContainer}>
            <Text style={styles.placeName}>{place.name}</Text>
            {place.address && (
              <Text style={styles.placeAddress}>{place.address}</Text>
            )}
          </View>

          {/* Event Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome do evento:</Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder={`Ex: ${eventLabel} - ${place.name}`}
              placeholderTextColor="#999999"
              autoFocus={true}
              maxLength={100}
            />
            <Text style={styles.inputHint}>
              {eventName.length}/100 caracteres
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>Enviar!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    padding: 25,
    width: "90%",
    maxWidth: 400,
  },
  headerIconContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7db2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconText: {
    fontSize: 30,
  },
  eventLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
  },
  placeInfoContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 14,
    color: "#666666",
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
  inputHint: {
    fontSize: 12,
    color: "#cccccc",
    textAlign: "right",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#7db2ff",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
