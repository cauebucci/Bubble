import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";

interface Event {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  startsAt: string;
  endsAt: string;
  createdBy?: string;
  owner?: string | { _id?: string; id?: string };
  checkedIn?: boolean;
  checkedOut?: boolean;
}

interface EventDetailsModalProps {
  visible: boolean;
  event: Event | null;
  userLocation: { lat: number; lng: number } | null;
  currentUserId?: string;
  onClose: () => void;
  onCheckIn: (eventId: string) => Promise<void>;
  onCheckOut: (eventId: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  onAddAttendance?: (eventId: string, probability: number) => Promise<void>;
  onOpenProbability?: () => void;
}

export default function EventDetailsModal({
  visible,
  event,
  userLocation,
  currentUserId,
  onClose,
  onCheckIn,
  onCheckOut,
  onDelete,
  onAddAttendance,
  onOpenProbability,
}: EventDetailsModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!event) return null;

  // Verificar se o usuário atual é o dono do evento
  const isOwner = (() => {
    if (!currentUserId) {
      console.log("EventDetailsModal: currentUserId não disponível");
      return false;
    }
    
    console.log("EventDetailsModal: Verificando ownership", {
      currentUserId,
      eventOwner: event.owner,
      eventCreatedBy: event.createdBy,
      ownerType: typeof event.owner,
    });
    
    // Verificar owner como string
    if (typeof event.owner === 'string') {
      const matches = event.owner === currentUserId;
      console.log("EventDetailsModal: Comparação owner string:", matches);
      return matches;
    }
    
    // Verificar owner como objeto
    if (typeof event.owner === 'object' && event.owner !== null) {
      const ownerObj = event.owner as { _id?: string; id?: string };
      const matches = ownerObj._id === currentUserId || ownerObj.id === currentUserId;
      console.log("EventDetailsModal: Comparação owner objeto:", matches);
      return matches;
    }
    
    // Verificar createdBy como fallback
    const matches = event.createdBy === currentUserId;
    console.log("EventDetailsModal: Comparação createdBy:", matches);
    return matches;
  })();
  
  console.log("EventDetailsModal: isOwner result:", isOwner);

  const handleCheckIn = async () => {
    setLoading("checkin");
    try {
      await onCheckIn(event._id);
    } finally {
      setLoading(null);
    }
  };

  const handleCheckOut = async () => {
    setLoading("checkout");
    try {
      await onCheckOut(event._id);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Cancelar Evento",
      "Tem certeza que deseja cancelar este evento?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            setLoading("delete");
            try {
              await onDelete(event._id);
            } finally {
              setLoading(null);
            }
          },
        },
      ]
    );
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isCheckedIn = event.checkedIn && !event.checkedOut;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Detalhes do Evento</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventAddress}>{event.address}</Text>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Início:</Text>
              <Text style={styles.dateValue}>{formatDate(event.startsAt)}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Fim:</Text>
              <Text style={styles.dateValue}>{formatDate(event.endsAt)}</Text>
            </View>
          </View>

          {/* Status */}
          {isCheckedIn && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>✅ Você está no evento</Text>
            </View>
          )}


          {/* Actions */}
          <View style={styles.actionsContainer}>
            {(onAddAttendance || onOpenProbability) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.probabilityButton]}
                onPress={() => {
                  if (onOpenProbability) {
                    onOpenProbability();
                  }
                }}
                disabled={loading !== null}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>📊 Definir probabilidade</Text>
              </TouchableOpacity>
            )}

            {!isCheckedIn && !event.checkedOut && (
              <TouchableOpacity
                style={[styles.actionButton, styles.checkInButton]}
                onPress={handleCheckIn}
                disabled={loading !== null || !userLocation}
                activeOpacity={0.7}
              >
                {loading === "checkin" ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.actionButtonText}>📍 Check-in</Text>
                )}
              </TouchableOpacity>
            )}

            {isCheckedIn && (
              <TouchableOpacity
                style={[styles.actionButton, styles.checkOutButton]}
                onPress={handleCheckOut}
                disabled={loading !== null || !userLocation}
                activeOpacity={0.7}
              >
                {loading === "checkout" ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.actionButtonText}>🚪 Check-out</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Mostrar botão de deletar apenas se o usuário for o dono do evento */}
            {isOwner && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={loading !== null}
                activeOpacity={0.7}
              >
                {loading === "delete" ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.actionButtonText}>🗑️ Deletar</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 24,
    color: "#ffffff",
  },
  eventInfo: {
    marginBottom: 20,
  },
  eventName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  eventAddress: {
    fontSize: 16,
    color: "#cccccc",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "#999",
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    color: "#7db2ff",
    fontWeight: "500",
  },
  statusContainer: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    minHeight: 50,
  },
  checkInButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
  },
  checkOutButton: {
    backgroundColor: "#FF9800",
    borderColor: "#F57C00",
  },
  deleteButton: {
    backgroundColor: "#F44336",
    borderColor: "#C62828",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  probabilityButton: {
    backgroundColor: "#7db2ff",
    borderColor: "#5a9aff",
  },
});

