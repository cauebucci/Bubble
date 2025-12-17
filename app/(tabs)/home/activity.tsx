import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { eventsAPI, userAPI, UnauthorizedError } from "@/services/api";
import { showError } from "@/utils/showAlert";

// Avatar padrão
const DEFAULT_AVATAR_URI = require("@/assets/images/icon.png");

// Lista de nomes aleatórios
const RANDOM_NAMES = [
  "Isabella Valland",
  "Marcela Prando",
  "João Guedea",
  "Arthur Tamer",
  "Mariana Machado",
  "Lucas Silva",
  "Ana Paula",
  "Rafael Costa",
  "Julia Santos",
  "Pedro Alves",
  "Camila Oliveira",
  "Bruno Ferreira",
  "Fernanda Lima",
  "Gabriel Souza",
  "Beatriz Rocha",
  "Thiago Martins",
  "Larissa Gomes",
  "Felipe Ribeiro",
  "Amanda Dias",
  "Rodrigo Araújo",
];

interface AttendancePost {
  _id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  eventId: string;
  eventName: string;
  eventAddress: string;
  probability: number;
  createdAt: string;
}

export default function ActivityScreen() {
  const [posts, setPosts] = useState<AttendancePost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadActivityPosts();
  }, []);

  const handleAuthError = (error: any): boolean => {
    if (error instanceof UnauthorizedError) {
      console.log("Erro de autenticação detectado, fazendo logout automático...");
      router.replace("/account/login");
      return true;
    }
    return false;
  };

  const loadActivityPosts = async () => {
    try {
      setLoading(true);
      const events = await eventsAPI.getEvents();
      
      // Buscar informações dos usuários para os posts
      const allPosts: AttendancePost[] = [];
      
      for (const event of events) {
        if (event.attendance && Array.isArray(event.attendance)) {
          for (const attendance of event.attendance) {
            // attendance pode ter userId ou user como objeto
            const userId = attendance.userId || 
                          attendance.user?._id || 
                          attendance.user?.id ||
                          (typeof attendance.user === 'string' ? attendance.user : null);
            
            if (!userId) continue;

            // Buscar dados do usuário do attendance
            let userName = "Usuário";
            let userPhoto: string | undefined;
            
            // O attendance pode ter o user populado pelo backend
            if (attendance.user) {
              if (typeof attendance.user === 'object' && attendance.user !== null) {
                userName = attendance.user.name || attendance.userName || "Usuário";
                userPhoto = attendance.user.photo || attendance.userPhoto;
              }
            }
            
            // Se ainda não tiver nome, usar nome aleatório baseado no userId
            if (userName === "Usuário" || !userName) {
              // Usar o userId como seed para escolher um nome aleatório consistente
              const userIdHash = userId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
              const nameIndex = userIdHash % RANDOM_NAMES.length;
              userName = RANDOM_NAMES[nameIndex];
            }

            const post: AttendancePost = {
              _id: attendance._id || `${event._id}-${userId}`,
              userId,
              userName,
              userPhoto,
              eventId: event._id,
              eventName: event.name,
              eventAddress: event.address,
              probability: attendance.probability || 0,
              createdAt: attendance.createdAt || attendance.updatedAt || new Date().toISOString(),
            };
            
            allPosts.push(post);
          }
        }
      }
      
      // Ordenar por data (mais recente primeiro)
      allPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setPosts(allPosts);
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      console.error("Erro ao carregar posts de atividade:", error);
      showError("Não foi possível carregar as atividades. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "agora";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} ${days === 1 ? "dia" : "dias"} atrás`;
    }
  };

  const getProbabilityColor = (probability: number): string => {
    if (probability >= 80) return "#4CAF50"; // Verde
    if (probability >= 50) return "#7db2ff"; // Azul
    return "#9C27B0"; // Roxo
  };

  const getProbabilityText = (probability: number, eventName: string): string => {
    if (probability === 0) {
      return "Preferiu guardar segredo... Shhh.";
    }
    if (probability === 100 && eventName.toLowerCase().includes("casa")) {
      return `Tem ${probability}% de chance de ficar em casa.`;
    }
    return `Tem ${probability}% de chance de ir para ${eventName}.`;
  };

  const getUserPhoto = (userPhoto?: string): any => {
    if (userPhoto && userPhoto.trim() !== "") {
      return { uri: userPhoto };
    }
    return DEFAULT_AVATAR_URI;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={24} color="#ffffff" />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7db2ff" />
          <Text style={styles.loadingText}>Carregando atividades...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={24} color="#ffffff" />
        </View>
      </View>

      {/* Posts Feed */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma atividade ainda</Text>
            <Text style={styles.emptySubtext}>Quando alguém definir a probabilidade de ir em um evento, aparecerá aqui</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post._id} style={styles.postContainer}>
              {/* Profile Picture and Name */}
              <View style={styles.postHeader}>
                <Image
                  source={getUserPhoto(post.userPhoto)}
                  style={styles.profilePicture}
                />
                <View style={styles.postHeaderText}>
                  <Text style={styles.userName}>{post.userName}</Text>
                  <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
                </View>
              </View>

              {/* Post Content */}
              <View style={styles.postContent}>
                <Text style={styles.postText}>
                  {post.probability === 0 ? (
                    "Preferiu guardar segredo... Shhh."
                  ) : post.probability === 100 && (post.eventName.toLowerCase().includes("casa") || post.eventName.toLowerCase().includes("home")) ? (
                    <>
                      Tem <Text style={[styles.probabilityHighlight, { color: getProbabilityColor(post.probability) }]}>{post.probability}%</Text> de chance de ficar em casa.
                    </>
                  ) : (
                    <>
                      Tem <Text style={[styles.probabilityHighlight, { color: getProbabilityColor(post.probability) }]}>{post.probability}%</Text> de chance de ir para <Text>{post.eventName}</Text>.
                    </>
                  )}
                </Text>
              </View>

            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: "#1a1a1a",
  },
  backButton: {
    padding: 8,
  },
  headerIcon: {
    flex: 1,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#999999",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  postContainer: {
    backgroundColor: "#2a2a2a",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333333",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#3a3a3a",
  },
  postHeaderText: {
    flex: 1,
  },
  userName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  timeAgo: {
    color: "#999999",
    fontSize: 12,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
  },
  probabilityHighlight: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
