import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  Keyboard,
} from "react-native";
import { userAPI } from "@/services/api";
import { showError, showSuccess, showAlert } from "@/utils/showAlert";

// Avatar padrão
const DEFAULT_AVATAR_URI = require("@/assets/images/icon.png");

interface Friend {
  _id?: string; // MongoDB usa _id
  id?: string; // API pode retornar id
  name: string;
  email?: string;
  photo?: string;
  lat?: number;
  lon?: number;
}

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [friendIdToAdd, setFriendIdToAdd] = useState("");
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isRemovingFriend, setIsRemovingFriend] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await userAPI.getFriends();
      setFriends(friendsList || []);
    } catch (error) {
      console.error("Erro ao carregar amigos:", error);
      showError("Não foi possível carregar a lista de amigos. Tente novamente.");
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendIdToAdd.trim()) {
      showError("Por favor, insira o ID do amigo.");
      return;
    }

    try {
      setIsAddingFriend(true);
      await userAPI.addFriend(friendIdToAdd.trim());
      showSuccess("Amigo adicionado com sucesso!");
      setFriendIdToAdd("");
      Keyboard.dismiss();
      await loadFriends();
    } catch (error) {
      console.error("Erro ao adicionar amigo:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o amigo. Verifique se o ID está correto."
      );
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    // Validar se o friendId é válido
    if (!friendId || friendId.trim() === "") {
      showError("ID do amigo inválido. Não foi possível remover.");
      return;
    }

    showAlert(
      "Remover Amigo",
      `Tem certeza que deseja remover ${friendName} dos seus amigos?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              setIsRemovingFriend(friendId);
              await userAPI.removeFriend(friendId.trim());
              showSuccess("Amigo removido com sucesso!");
              await loadFriends();
            } catch (error) {
              console.error("Erro ao remover amigo:", error);
              showError(
                error instanceof Error
                  ? error.message
                  : "Não foi possível remover o amigo. Tente novamente."
              );
            } finally {
              setIsRemovingFriend(null);
            }
          },
        },
      ],
      "warning"
    );
  };

  const getUserPhoto = (friend: Friend) => {
    if (friend?.photo && friend.photo.trim() !== "") {
      return { uri: friend.photo };
    }
    return DEFAULT_AVATAR_URI;
  };

  // Função helper para obter o ID do amigo (suporta tanto _id quanto id)
  const getFriendId = (friend: Friend): string | undefined => {
    return friend._id || friend.id;
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchText.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7db2ff" />
        <Text style={styles.loadingText}>Carregando amigos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Amigos</Text>
        <Text style={styles.subtitle}>
          {friends.length} {friends.length === 1 ? "amigo" : "amigos"}
        </Text>
      </View>

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar amigos..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Adicionar Amigo */}
      <View style={styles.addFriendContainer}>
        <Text style={styles.addFriendLabel}>Adicionar Amigo</Text>
        <View style={styles.addFriendRow}>
          <TextInput
            style={styles.addFriendInput}
            placeholder="ID do amigo"
            placeholderTextColor="#999"
            value={friendIdToAdd}
            onChangeText={setFriendIdToAdd}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[
              styles.addFriendButton,
              isAddingFriend && styles.addFriendButtonDisabled,
            ]}
            onPress={handleAddFriend}
            disabled={isAddingFriend}
            activeOpacity={0.7}
          >
            {isAddingFriend ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.addFriendButtonText}>Adicionar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Amigos */}
      <ScrollView
        style={styles.friendsList}
        contentContainerStyle={styles.friendsListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFriends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>
              {searchText
                ? "Nenhum amigo encontrado"
                : friends.length === 0
                ? "Você ainda não tem amigos"
                : "Nenhum amigo encontrado"}
            </Text>
            {friends.length === 0 && (
              <Text style={styles.emptySubtext}>
                Adicione amigos usando o ID acima
              </Text>
            )}
          </View>
        ) : (
          filteredFriends.map((friend, index) => {
            const friendId = getFriendId(friend);
            return (
              <View key={friendId || `friend-${index}`} style={styles.friendItem}>
                <Image
                  source={getUserPhoto(friend)}
                  style={styles.friendAvatar}
                  defaultSource={DEFAULT_AVATAR_URI}
                />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  {friend.email && (
                    <Text style={styles.friendEmail}>{friend.email}</Text>
                  )}
                  {friend.lat && friend.lon && (
                    <Text style={styles.friendLocation}>
                      📍 Localização disponível
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    if (friendId) {
                      handleRemoveFriend(friendId, friend.name || "amigo");
                    } else {
                      showError("ID do amigo não encontrado. Não foi possível remover.");
                    }
                  }}
                  disabled={isRemovingFriend === friendId}
                  activeOpacity={0.7}
                >
                  {isRemovingFriend === friendId ? (
                  <ActivityIndicator size="small" color="#ff4444" />
                ) : (
                  <Text style={styles.removeButtonText}>✕</Text>
                )}
              </TouchableOpacity>
            </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25003d",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25003d",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#25003d",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7db2ff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6a0dad",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  addFriendContainer: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6a0dad",
  },
  addFriendLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  addFriendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addFriendInput: {
    flex: 1,
    backgroundColor: "#6a0dad",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    fontSize: 14,
  },
  addFriendButton: {
    backgroundColor: "#7db2ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  addFriendButtonDisabled: {
    opacity: 0.7,
  },
  addFriendButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  friendsList: {
    flex: 1,
  },
  friendsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#6a0dad",
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#7db2ff",
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  friendEmail: {
    color: "#999",
    fontSize: 14,
    marginBottom: 4,
  },
  friendLocation: {
    color: "#7db2ff",
    fontSize: 12,
  },
  removeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
});
