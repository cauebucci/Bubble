import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { placesAPI, SearchResult } from "@/services/places";

interface PlaceSearchModalProps {
  visible: boolean;
  eventType: string;
  eventLabel: string;
  eventIcon: string;
  onClose: () => void;
  onSelectPlace: (place: SearchResult) => void;
}

const EVENT_INFO: Record<string, { icon: string; label: string }> = {
  houseparty: { icon: "🏠🎉", label: "HouseParty" },
  dinner: { icon: "🍴", label: "Jantar fora" },
  bar: { icon: "🍺", label: "Bar" },
  secret: { icon: "🤐", label: "Segredo" },
  party: { icon: "💃", label: "Festa" },
  date: { icon: "💑", label: "Date" },
  sleep: { icon: "😴", label: "Dormir" },
  looking: { icon: "🔍", label: "Procurando..." },
};

export default function PlaceSearchModal({
  visible,
  eventType,
  eventLabel,
  eventIcon,
  onClose,
  onSelectPlace,
}: PlaceSearchModalProps) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearchText("");
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        performSearch(searchText);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const searchResults = await placesAPI.searchPlaces(query);
      setResults(searchResults);
    } catch (error) {
      console.error("Erro ao buscar lugares:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectPlace(result);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{eventIcon}</Text>
            </View>
            <Text style={styles.eventLabel}>{eventLabel}</Text>
            <Text style={styles.qualText}>Qual?</Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite aqui"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
            <TouchableOpacity style={styles.searchIconButton}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Results */}
          {results.length > 0 && (
            <View style={styles.resultsContainer}>
              <ScrollView
                style={styles.resultsScroll}
                keyboardShouldPersistTaps="handled"
              >
                {results.map((result, index) => (
                  <TouchableOpacity
                    key={result.id}
                    style={[
                      styles.resultItem,
                      index === results.length - 1 && styles.resultItemLast,
                    ]}
                    onPress={() => handleSelectResult(result)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultIcon}>
                      {result.type === "place" ? (
                        <Text style={styles.pinIcon}>📍</Text>
                      ) : (
                        <Text style={styles.searchIconSmall}>🔍</Text>
                      )}
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultName} numberOfLines={1}>
                        {result.name}
                      </Text>
                      {result.address && (
                        <Text style={styles.resultAddress} numberOfLines={1}>
                          {result.address}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          )}

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
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#7db2ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconText: {
    fontSize: 40,
  },
  eventLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  qualText: {
    fontSize: 18,
    color: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchIconButton: {
    padding: 5,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchIconSmall: {
    fontSize: 18,
  },
  resultsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    maxHeight: 300,
    marginBottom: 15,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  resultItemLast: {
    borderBottomWidth: 0,
  },
  resultIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  pinIcon: {
    fontSize: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 12,
    color: "#666666",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 10,
  },
  closeButton: {
    alignItems: "center",
    padding: 10,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
});




