import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";

interface EventType {
  id: string;
  icon: string;
  label: string;
}

const EVENT_TYPES: EventType[] = [
  { id: "houseparty", icon: "🏠🎉", label: "HouseParty" },
  { id: "dinner", icon: "🍴", label: "Jantar fora" },
  { id: "bar", icon: "🍺", label: "Bar" },
  { id: "secret", icon: "🤐", label: "Segredo" },
  { id: "party", icon: "💃", label: "Festa" },
  { id: "date", icon: "💑", label: "Date" },
  { id: "sleep", icon: "😴", label: "Dormir" },
  { id: "looking", icon: "🔍", label: "Procurando..." },
];

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
}

export default function EventModal({
  visible,
  onClose,
  onSelectType,
}: EventModalProps) {
  const getDayOfWeek = () => {
    const days = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return days[new Date().getDay()];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {getDayOfWeek()}, qual é a boa?!
          </Text>

          <ScrollView
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {EVENT_TYPES.map((eventType) => (
              <TouchableOpacity
                key={eventType.id}
                style={styles.eventButton}
                onPress={() => onSelectType(eventType.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{eventType.icon}</Text>
                </View>
                <Text style={styles.labelText}>{eventType.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
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
    maxHeight: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 25,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  eventButton: {
    width: "23%",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#7db2ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 32,
  },
  labelText: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
});




