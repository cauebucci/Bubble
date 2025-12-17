import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
  Modal,
  Alert,
} from "react-native";
// Import condicional do MapView apenas para plataformas nativas (não web)
let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== "web") {
  const MapsModule = require("react-native-maps");
  MapView = MapsModule.default;
  Marker = MapsModule.Marker;
  PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
}
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { userAPI, authAPI, eventsAPI, UnauthorizedError } from "@/services/api";
import { placesAPI, SearchResult } from "@/services/places";
import { SP_BARS_AND_CLUBS } from "@/services/places";
import EventModal from "@/components/EventModal";
import PlaceSearchModal from "@/components/PlaceSearchModal";
import ConfirmEventModal from "@/components/ConfirmEventModal";
import EventDetailsModal from "@/components/EventDetailsModal";
import ProbabilityModal from "@/components/ProbabilityModal";
import { showError, showSuccess, showWarning, showAlert } from "@/utils/showAlert";

// Avatar padrão (usar o ícone do app como fallback)
const DEFAULT_AVATAR_URI = require("@/assets/images/icon.png");

interface Friend {
  _id?: string; // MongoDB usa _id
  id?: string; // API pode retornar id
  name: string;
  email: string;
  photo?: string;
  lat?: number;
  lon?: number;
}

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

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.01, // Zoom inicial maior
    longitudeDelta: 0.01,
  });
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Estados para modais de evento
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPlaceSearchModal, setShowPlaceSearchModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedEventLabel, setSelectedEventLabel] = useState<string>("");
  const [selectedEventIcon, setSelectedEventIcon] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  
  // Estado para modal de perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estados para eventos
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  
  // Estados para modal de probabilidade
  const [showProbabilityModal, setShowProbabilityModal] = useState(false);
  const [eventForProbability, setEventForProbability] = useState<Event | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    requestLocationPermission();
    loadUserData();
    loadFriends();
    loadEvents();
  }, []);

  // Recarregar eventos periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      loadEvents();
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Atualizar localização a cada 30 segundos
  useEffect(() => {
    const updateLocationInterval = setInterval(async () => {
      try {
        // Verificar se temos permissão de localização
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        // Obter localização atual
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Atualizar localização na API
        await userAPI.updateMe({
          lat: currentLocation.coords.latitude,
          lon: currentLocation.coords.longitude,
        });

        // Atualizar estado local
        const userCoords = {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        };
        setLocation(currentLocation);
        setUserLocation(userCoords);
      } catch (error) {
        // Se for erro de autenticação, fazer logout
        if (error instanceof UnauthorizedError) {
          handleAuthError(error);
          clearInterval(updateLocationInterval);
          return;
        }
        console.error("Erro ao atualizar localização automaticamente:", error);
      }
    }, 30000); // 30 segundos

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(updateLocationInterval);
  }, []);

  useEffect(() => {
    // Buscar lugares quando o texto mudar (debounce)
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        performSearch(searchText);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showWarning(
          "Permissão de localização é necessária para usar o mapa.",
          "Permissão Negada"
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const userCoords = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      };
      
      setLocation(currentLocation);
      setUserLocation(userCoords);
      setRegion({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        latitudeDelta: 0.01, // Zoom maior (mais próximo)
        longitudeDelta: 0.01,
      });

      // Atualizar localização na API
      try {
        await userAPI.updateMe({
          lat: currentLocation.coords.latitude,
          lon: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error("Erro ao atualizar localização na API:", error);
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    }
  };

  const loadUserData = async () => {
    try {
      const data = await userAPI.getMe();
      console.log("HomeScreen: Dados do usuário recebidos da API:", {
        data,
        userId: data?._id || data?.id,
        allKeys: Object.keys(data || {}),
      });
      // Garantir que sempre tenha uma foto (padrão se não tiver)
      setUserData({
        ...data,
        photo: data?.photo && data.photo.trim() !== "" ? data.photo : undefined,
      });
      setApiError(null); // Limpar erro se sucesso
      setLoading(false);
    } catch (error) {
      if (handleAuthError(error)) {
        return; // Erro de autenticação tratado, não mostrar mensagem adicional
      }
      console.error("Erro ao carregar dados do usuário:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      if (errorMessage.includes("conectar à API") || errorMessage.includes("Network")) {
        setApiError("API não disponível. Verifique se o servidor está rodando.");
      }
      // Se houver erro, preservar dados anteriores incluindo foto
      setUserData((prev: any) => ({
        name: prev?.name || "Usuário",
        email: prev?.email || "",
        photo: prev?.photo && prev.photo.trim() !== "" ? prev.photo : undefined,
      }));
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsList = await userAPI.getFriends();
      setFriends(friendsList || []);
      setApiError(null); // Limpar erro se sucesso
    } catch (error) {
      if (handleAuthError(error)) {
        return; // Erro de autenticação tratado, não mostrar mensagem adicional
      }
      console.error("Erro ao carregar amigos:", error);
      // Continuar com lista vazia em caso de erro
      setFriends([]);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsList = await eventsAPI.getEvents();
      console.log("Eventos carregados da API:", eventsList);
      
      // Normalizar eventos: verificar se têm coordenadas em coords.coordinates ou lat/lon
      const normalizedEvents = (eventsList || []).map((event: any) => {
        // Se tiver coords.coordinates (formato GeoJSON: [lon, lat])
        if (event.coords && event.coords.coordinates && Array.isArray(event.coords.coordinates)) {
          return {
            ...event,
            lon: event.coords.coordinates[0],
            lat: event.coords.coordinates[1],
          };
        }
        // Se já tiver lat/lon, usar diretamente
        return event;
      }).filter((event: any) => {
        // Filtrar apenas eventos com coordenadas válidas
        const hasValidCoords = event.lat != null && event.lon != null && 
                               !isNaN(event.lat) && !isNaN(event.lon);
        if (!hasValidCoords) {
          console.warn("Evento sem coordenadas válidas:", event);
        }
        return hasValidCoords;
      });
      
      console.log("Eventos normalizados:", normalizedEvents);
      setEvents(normalizedEvents);
    } catch (error) {
      if (handleAuthError(error)) {
        return; // Erro de autenticação tratado, não mostrar mensagem adicional
      }
      console.error("Erro ao carregar eventos:", error);
      setEvents([]);
    }
  };

  const getUserPhoto = (user: any) => {
    // Se não tiver usuário ou não tiver foto válida, retornar avatar padrão
    if (!user || !user.photo || user.photo.trim() === "") {
      return DEFAULT_AVATAR_URI;
    }
    // Retornar URI da foto do usuário
    return { uri: user.photo };
  };

  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const location = region
        ? { lat: region.latitude, lng: region.longitude }
        : undefined;

      const results = await placesAPI.searchPlaces(query, location);
      setSearchResults(results);
    } catch (error) {
      console.error("Erro ao buscar lugares:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (searchText.trim().length >= 2) {
      performSearch(searchText);
    }
  };

  const handleSelectResult = async (result: SearchResult) => {
    Keyboard.dismiss(); // Fechar o teclado
    setSearchText("");
    setSearchResults([]);

    if (result.type === "place" && result.lat && result.lon) {
      // Navegar para o lugar no mapa e manter lá
      setRegion({
        latitude: result.lat,
        longitude: result.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (result.type === "place") {
      // Buscar coordenadas do lugar
      try {
        const details = await placesAPI.getPlaceDetails(result.id);
        if (details) {
          setRegion({
            latitude: details.lat,
            longitude: details.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error("Erro ao obter coordenadas do lugar:", error);
      }
    } else if (result.type === "search") {
      // Implementar ação de pesquisa geral
      console.log("Pesquisar:", result.name);
    }
  };

  const returnToUserLocation = () => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01, // Zoom maior (mais próximo)
        longitudeDelta: 0.01,
      });
    }
  };

  // Verificar se o usuário está longe da localização inicial
  const isAwayFromUserLocation = () => {
    if (!userLocation) return false;
    
    const distance = Math.sqrt(
      Math.pow(region.latitude - userLocation.lat, 2) +
      Math.pow(region.longitude - userLocation.lng, 2)
    );
    
    // Considerar "longe" se estiver a mais de ~0.01 graus (aproximadamente 1km)
    return distance > 0.01;
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.replace("/account/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      showError("Não foi possível fazer logout. Tente novamente.");
    }
  };

  // Função auxiliar para tratar erros de autenticação
  const handleAuthError = (error: unknown) => {
    if (error instanceof UnauthorizedError) {
      console.log("Erro de autenticação detectado, fazendo logout automático...");
      // O token já foi removido pela função request, só precisamos redirecionar
      router.replace("/account/login");
      return true; // Indica que o erro foi tratado
    }
    return false; // Erro não foi tratado aqui
  };

  // Função para selecionar e atualizar foto do perfil
  const handleSelectPhoto = () => {
    // Fechar o modal de perfil antes de abrir o alerta
    setShowProfileModal(false);
    
    // Usar requestAnimationFrame para garantir que o modal foi fechado antes de abrir o alerta
    requestAnimationFrame(() => {
      Alert.alert(
        "Alterar Foto",
        "Escolha uma opção",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
              // Reabrir o modal de perfil se cancelar
              requestAnimationFrame(() => {
                setShowProfileModal(true);
              });
            },
          },
          {
            text: "Galeria",
            onPress: async () => {
              try {
                // Solicitar permissão para acessar a galeria
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  showWarning(
                    "É necessário permitir o acesso à galeria para alterar a foto de perfil.",
                    "Permissão Negada"
                  );
                  return;
                }

                // Abrir seletor de imagem
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                  await uploadPhoto(result.assets[0].uri);
                }
              } catch (error) {
                console.error("Erro ao selecionar foto:", error);
                showError("Não foi possível selecionar a foto. Tente novamente.");
              }
            },
          },
          {
            text: "Câmera",
            onPress: async () => {
              try {
                // Solicitar permissão para acessar a câmera
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                  showWarning(
                    "É necessário permitir o acesso à câmera para tirar uma foto de perfil.",
                    "Permissão Negada"
                  );
                  return;
                }

                // Abrir câmera
                const result = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                  await uploadPhoto(result.assets[0].uri);
                }
              } catch (error) {
                console.error("Erro ao tirar foto:", error);
                showError("Não foi possível tirar a foto. Tente novamente.");
              }
            },
          },
        ]
      );
    });
  };

  // Função auxiliar para fazer upload da foto
  const uploadPhoto = async (photoUri: string) => {
    setUploadingPhoto(true);

    // Atualizar foto localmente imediatamente para feedback visual
    setUserData((prev: any) => ({
      ...prev,
      photo: photoUri,
    }));

    try {
      // Atualizar foto via API
      const updatedUser = await userAPI.updateMe({
        photo: photoUri,
      });

      // Se a API retornou dados atualizados, usar eles
      if (updatedUser && updatedUser.photo) {
        setUserData((prev: any) => ({
          ...prev,
          ...updatedUser,
          // Garantir que a foto seja preservada
          photo: updatedUser.photo || photoUri,
        }));
      } else {
        // Se não, recarregar dados do usuário mas preservar a foto
        try {
          const reloadedData = await userAPI.getMe();
          setUserData((prev: any) => ({
            ...reloadedData,
            // Preservar a foto se a API não retornou ela ou se retornou vazia
            photo: reloadedData?.photo || prev?.photo || photoUri,
          }));
        } catch (reloadError) {
          // Se falhar ao recarregar, manter a foto local
          console.error("Erro ao recarregar dados:", reloadError);
          setUserData((prev: any) => ({
            ...prev,
            photo: photoUri,
          }));
        }
      }

      showSuccess("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);
      // Em caso de erro, manter a foto localmente para não perder
      setUserData((prev: any) => ({
        ...prev,
        photo: photoUri,
      }));
      showError("Não foi possível atualizar a foto. Tente novamente.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7db2ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Aviso de erro da API */}
      {apiError && (
        <View style={styles.apiErrorContainer}>
          <Text style={styles.apiErrorText}>⚠️ {apiError}</Text>
        </View>
      )}

      {/* Barra Superior */}
      <View style={[
        styles.topBar,
        apiError && {
          top: Platform.OS === "ios" ? 110 : 90,
        }
      ]}>
        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            {isSearching ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.searchIcon}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Ícone de Amigos */}
        <TouchableOpacity
          style={styles.friendsButton}
          onPress={() => router.push("/(tabs)/home/friends")}
        >
          <View style={styles.friendsIconContainer}>
            <Text style={styles.friendsIcon}>👥</Text>
            <View style={styles.friendsBadge}>
              <Text style={styles.friendsBadgeText}>{friends.length}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Avatar do Usuário */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setShowProfileModal(true)}
        >
          <Image
            source={getUserPhoto(userData)}
            style={styles.avatar}
            defaultSource={require("@/assets/images/icon.png")}
          />
          {friends.length > 0 && (
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>+{friends.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Overlay de Resultados da Pesquisa */}
      {searchResults.length > 0 && (
        <View style={[
          styles.searchResultsContainer,
          apiError && {
            top: Platform.OS === "ios" ? 200 : 180,
          }
        ]}>
          <ScrollView
            style={styles.searchResultsScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={result.id}
                style={[
                  styles.searchResultItem,
                  index === searchResults.length - 1 && styles.searchResultItemLast,
                ]}
                onPress={() => handleSelectResult(result)}
                activeOpacity={0.7}
              >
                <View style={styles.searchResultIcon}>
                  {result.type === "place" ? (
                    <Text style={styles.pinIcon}>📍</Text>
                  ) : (
                    <Text style={styles.searchResultIconText}>🔍</Text>
                  )}
                </View>
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultName} numberOfLines={1}>
                    {result.name}
                  </Text>
                  {result.address && (
                    <Text style={styles.searchResultAddress} numberOfLines={1}>
                      {result.address}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Mapa - apenas em plataformas nativas */}
      {Platform.OS !== "web" && MapView ? (
        <MapView
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion: any) => {
            setRegion(newRegion);
          }}
          customMapStyle={darkMapStyle}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
        {/* Marcar localização do usuário atual */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
          >
            <View style={styles.userMarker}>
              <Image
                source={getUserPhoto(userData)}
                style={styles.markerAvatar}
              />
            </View>
          </Marker>
        )}

        {/* Marcar amigos no mapa */}
        {friends
          .filter((friend) => friend.lat && friend.lon)
          .map((friend) => (
            <Marker
              key={friend._id || friend.id}
              coordinate={{
                latitude: friend.lat!,
                longitude: friend.lon!,
              }}
              title={friend.name}
            >
              <View style={styles.friendMarker}>
                <Image
                  source={getUserPhoto(friend)}
                  style={styles.markerAvatar}
                />
              </View>
            </Marker>
          ))}

        {/* Marcar bares e baladas */}
        {SP_BARS_AND_CLUBS.map((place) => (
          <Marker
            key={place.name}
            coordinate={{
              latitude: place.lat,
              longitude: place.lng,
            }}
            title={place.name}
            description={place.address}
          >
            <View style={styles.placeMarker}>
              <View
                style={[
                  styles.placeMarkerIcon,
                  place.type === "bar" ? styles.barMarker : styles.baladaMarker,
                ]}
              >
                <Text style={styles.placeMarkerEmoji}>
                  {place.type === "bar" ? "🍺" : "🎉"}
                </Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* Marcar eventos */}
        {events
          .filter((event) => {
            const hasValidCoords = event.lat != null && event.lon != null && 
                                   !isNaN(Number(event.lat)) && !isNaN(Number(event.lon));
            if (!hasValidCoords) {
              console.warn("Evento sem coordenadas válidas no render:", event);
            }
            return hasValidCoords;
          })
          .map((event) => (
            <Marker
              key={event._id || `event-${event.lat}-${event.lon}`}
              coordinate={{
                latitude: Number(event.lat),
                longitude: Number(event.lon),
              }}
              title={event.name}
              description={event.address}
              onPress={() => {
                setSelectedEvent(event);
                setShowEventDetailsModal(true);
              }}
            >
            <View style={styles.eventMarker}>
              {/* Anel externo pulsante */}
              <View style={styles.eventMarkerPulse} />
              {/* Anel médio */}
              <View style={styles.eventMarkerRing}>
                {/* Ícone principal */}
                <View style={styles.eventMarkerIcon}>
                  <Text style={styles.eventMarkerEmoji}>🎉</Text>
                </View>
              </View>
            </View>
          </Marker>
        ))}
        </MapView>
      ) : (
        <View style={[styles.map, styles.webMapPlaceholder]}>
          <Text style={styles.webMapText}>
            Mapas não disponíveis na versão web{'\n'}
            Use iOS ou Android para visualizar o mapa
          </Text>
        </View>
      )}

      {/* Botão para retornar à localização */}
      {isAwayFromUserLocation() && userLocation && (
        <TouchableOpacity
          style={styles.returnLocationButton}
          onPress={returnToUserLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.returnLocationIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Botão Flutuante (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowEventModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de seleção de tipo de evento */}
      <EventModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSelectType={(type) => {
          const eventInfo = {
            houseparty: { icon: "🏠🎉", label: "HouseParty" },
            dinner: { icon: "🍴", label: "Jantar fora" },
            bar: { icon: "🍺", label: "Bar" },
            secret: { icon: "🤐", label: "Segredo" },
            party: { icon: "💃", label: "Festa" },
            date: { icon: "💑", label: "Date" },
            sleep: { icon: "😴", label: "Dormir" },
            looking: { icon: "🔍", label: "Procurando..." },
          };
          
          const info = eventInfo[type as keyof typeof eventInfo];
          if (info) {
            setSelectedEventType(type);
            setSelectedEventLabel(info.label);
            setSelectedEventIcon(info.icon);
            setShowEventModal(false);
            setShowPlaceSearchModal(true);
          }
        }}
      />

      {/* Modal de busca de lugar */}
      <PlaceSearchModal
        visible={showPlaceSearchModal}
        eventType={selectedEventType}
        eventLabel={selectedEventLabel}
        eventIcon={selectedEventIcon}
        onClose={() => {
          setShowPlaceSearchModal(false);
          setSelectedPlace(null);
        }}
        onSelectPlace={(place) => {
          setSelectedPlace(place);
          setShowPlaceSearchModal(false);
          setShowConfirmModal(true);
          
          // Focar no lugar selecionado no mapa
          if (place.lat && place.lon) {
            setRegion({
              latitude: place.lat,
              longitude: place.lon,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }
        }}
      />

      {/* Modal de confirmação */}
      <ConfirmEventModal
        visible={showConfirmModal}
        eventType={selectedEventType}
        eventLabel={selectedEventLabel}
        eventIcon={selectedEventIcon}
        place={selectedPlace}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedPlace(null);
        }}
        onConfirm={async (eventName) => {
          if (!selectedPlace || !selectedPlace.lat || !selectedPlace.lon) {
            showError("Localização do evento não encontrada.");
            return;
          }

          try {
            // Obter endereço completo do lugar
            const address = selectedPlace.address || selectedPlace.name || "Endereço não disponível";
            
            // Validar se o nome do lugar existe
            if (!selectedPlace.name || selectedPlace.name.trim() === "") {
              showError("Nome do lugar não encontrado.");
              return;
            }

            // Validar nome do evento
            if (!eventName || eventName.trim().length === 0) {
              showError("Por favor, informe um nome para o evento.");
              return;
            }

            // Calcular datas (início agora, fim em 4 horas)
            const startsAtDate = new Date();
            const endsAtDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 horas depois
            
            // Validar que endsAt é maior que startsAt
            if (endsAtDate <= startsAtDate) {
              showError("A data de término deve ser posterior à data de início.");
              return;
            }

            const startsAt = startsAtDate.toISOString();
            const endsAt = endsAtDate.toISOString();

            // Preparar dados do evento (formato exato esperado pela API)
            const eventData = {
              name: eventName.trim(),
              address: address.trim(),
              lat: Number(selectedPlace.lat),
              lon: Number(selectedPlace.lon),
              startsAt: startsAt, // ISO-8601 format: "2025-09-15T23:18:54.778Z"
              endsAt: endsAt, // ISO-8601 format: "2025-09-15T23:18:54.778Z"
            };

            // Validar dados antes de enviar
            if (!eventData.name || eventData.name.length === 0) {
              showError("Nome do evento inválido.");
              return;
            }
            if (!eventData.address || eventData.address.length === 0) {
              showError("Endereço do evento inválido.");
              return;
            }
            if (isNaN(eventData.lat) || isNaN(eventData.lon)) {
              showError("Coordenadas do evento inválidas.");
              return;
            }

            // Log do body exato que será enviado (para debug)
            console.log("Criando evento - Body que será enviado:", JSON.stringify(eventData, null, 2));
            console.log("startsAt:", eventData.startsAt, "| endsAt:", eventData.endsAt);
            console.log("Validação: startsAt < endsAt?", new Date(startsAt) < new Date(endsAt));

            // Criar evento na API
            await eventsAPI.createEvent(eventData);

            // Recarregar eventos
            await loadEvents();

            showSuccess(
              "Evento criado com sucesso!",
              "Evento criado!"
            );
            
            setShowConfirmModal(false);
            setSelectedPlace(null);
            setSelectedEventType("");
            setSelectedEventLabel("");
            setSelectedEventIcon("");
          } catch (error) {
            if (handleAuthError(error)) {
              return; // Erro de autenticação tratado, não mostrar mensagem adicional
            }
            console.error("Erro ao criar evento:", error);
            showError(
              error instanceof Error
                ? error.message
                : "Não foi possível criar o evento. Tente novamente.",
              "Erro ao criar evento"
            );
          }
        }}
      />

      {/* Modal de Detalhes do Evento */}
      <EventDetailsModal
        visible={showEventDetailsModal}
        event={selectedEvent}
        userLocation={userLocation}
        currentUserId={(() => {
          // Tentar obter o ID do usuário de várias formas possíveis
          const userId = userData?._id || 
                        userData?.id || 
                        (userData?.user?._id) || 
                        (userData?.user?.id);
          console.log("HomeScreen: Passando currentUserId para EventDetailsModal", {
            userId,
            userDataKeys: userData ? Object.keys(userData) : [],
            userData_id: userData?._id,
            userData_id_field: userData?.id,
            userData,
          });
          return userId;
        })()}
        onClose={() => {
          setShowEventDetailsModal(false);
          setSelectedEvent(null);
        }}
        onOpenProbability={() => {
          if (selectedEvent) {
            // Fechar o modal de detalhes primeiro
            setShowEventDetailsModal(false);
            // Usar setTimeout para garantir que o modal anterior feche antes de abrir o novo
            setTimeout(() => {
              setEventForProbability(selectedEvent);
              setShowProbabilityModal(true);
            }, 300);
          }
        }}
        onCheckIn={async (eventId: string) => {
          if (!userLocation) {
            showError("Localização não disponível para check-in.");
            return;
          }

          try {
            await eventsAPI.checkIn(eventId, userLocation.lat, userLocation.lng);
            setShowEventDetailsModal(false);
            setSelectedEvent(null);
            // Mostrar sucesso após fechar o modal para evitar sobreposição
            setTimeout(() => {
              showSuccess("Check-in realizado com sucesso!");
            }, 300);
            await loadEvents();
          } catch (error) {
            if (handleAuthError(error)) {
              return; // Erro de autenticação tratado, não mostrar mensagem adicional
            }
            console.error("Erro ao fazer check-in:", error);
            showError(
              error instanceof Error
                ? error.message
                : "Não foi possível fazer check-in. Tente novamente."
            );
          }
        }}
        onCheckOut={async (eventId: string) => {
          if (!userLocation) {
            showError("Localização não disponível para check-out.");
            return;
          }

          try {
            await eventsAPI.checkOut(eventId, userLocation.lat, userLocation.lng);
            setShowEventDetailsModal(false);
            setSelectedEvent(null);
            // Mostrar sucesso após fechar o modal para evitar sobreposição
            setTimeout(() => {
              showSuccess("Check-out realizado com sucesso!");
            }, 300);
            await loadEvents();
          } catch (error) {
            if (handleAuthError(error)) {
              return; // Erro de autenticação tratado, não mostrar mensagem adicional
            }
            console.error("Erro ao fazer check-out:", error);
            showError(
              error instanceof Error
                ? error.message
                : "Não foi possível fazer check-out. Tente novamente."
            );
          }
        }}
        onDelete={async (eventId: string) => {
          try {
            await eventsAPI.cancelEvent(eventId);
            setShowEventDetailsModal(false);
            setSelectedEvent(null);
            // Mostrar sucesso após fechar o modal para evitar sobreposição
            setTimeout(() => {
              showSuccess("Evento cancelado com sucesso!");
            }, 300);
            await loadEvents();
          } catch (error) {
            if (handleAuthError(error)) {
              return; // Erro de autenticação tratado, não mostrar mensagem adicional
            }
            console.error("Erro ao cancelar evento:", error);
            showError(
              error instanceof Error
                ? error.message
                : "Não foi possível cancelar o evento. Tente novamente."
            );
          }
        }}
      />

      {/* Modal de Probabilidade */}
      {eventForProbability && showProbabilityModal && (
        <ProbabilityModal
          visible={showProbabilityModal}
          eventName={eventForProbability.name}
          eventAddress={eventForProbability.address}
          eventIcon="🎉"
          onClose={() => {
            // Resetar estados imediatamente
            setShowProbabilityModal(false);
            // Usar setTimeout para garantir que o modal seja desmontado antes de limpar o evento
            setTimeout(() => {
              setEventForProbability(null);
            }, 100);
          }}
          onConfirm={async (probability: number) => {
            try {
              await eventsAPI.addAttendance(eventForProbability._id, probability);
              // Resetar estados imediatamente
              setShowProbabilityModal(false);
              // Usar setTimeout para garantir que o modal seja desmontado antes de limpar o evento e mostrar sucesso
              setTimeout(() => {
                setEventForProbability(null);
                showSuccess(`Probabilidade de ${probability}% definida com sucesso!`);
              }, 300);
              await loadEvents();
            } catch (error) {
              if (handleAuthError(error)) {
                return;
              }
              console.error("Erro ao definir probabilidade:", error);
              showError(
                error instanceof Error
                  ? error.message
                  : "Não foi possível definir a probabilidade. Tente novamente."
              );
              throw error; // Re-throw para que o modal possa mostrar o erro
            }
          }}
        />
      )}

      {/* Modal de Perfil */}
      {showProfileModal && (
        <Modal
          visible={showProfileModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProfileModal(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.profileModalOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.profileModalContent}
            >
            {/* Header do Modal */}
            <View style={styles.profileModalHeader}>
              <Text style={styles.profileModalTitle}>Perfil</Text>
              <TouchableOpacity
                onPress={() => setShowProfileModal(false)}
                style={styles.profileModalCloseButton}
              >
                <Text style={styles.profileModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Avatar e Informações */}
            <View style={styles.profileInfoContainer}>
              <View style={styles.profileAvatarContainer}>
                <Image
                  source={getUserPhoto(userData)}
                  style={styles.profileModalAvatar}
                  defaultSource={require("@/assets/images/icon.png")}
                />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleSelectPhoto}
                  disabled={uploadingPhoto}
                  activeOpacity={0.7}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.changePhotoIcon}>📷</Text>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.profileModalName}>
                {userData?.name || "Usuário"}
              </Text>
              <Text style={styles.profileModalStatus}>
                {userData?.status || "Online"}
              </Text>
            </View>

            {/* Botão de Logout */}
            <TouchableOpacity
              style={styles.profileLogoutButton}
              onPress={() => {
                // Fechar o modal primeiro
                setShowProfileModal(false);
                // Mostrar alert após fechar o modal para evitar sobreposição
                setTimeout(() => {
                  showAlert(
                    "Sair",
                    "Tem certeza que deseja sair?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                        onPress: () => {
                          // Se cancelar, não fazer nada
                        },
                      },
                      {
                        text: "Sair",
                        style: "destructive",
                        onPress: async () => {
                          await handleLogout();
                        },
                      },
                    ],
                    "warning"
                  );
                }, 300);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.profileLogoutButtonText}>🚪 Sair</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

// Estilo de mapa escuro
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
];

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
  apiErrorContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 15,
    right: 15,
    backgroundColor: "#ff6b6b",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    marginTop: 10,
  },
  apiErrorText: {
    color: "#ffffff",
    fontSize: 12,
    textAlign: "center",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#6a0dad",
    borderRadius: 25,
    alignItems: "center",
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },
  searchButton: {
    padding: 5,
  },
  searchIcon: {
    fontSize: 18,
  },
  friendsButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  friendsIconContainer: {
    position: "relative",
  },
  friendsIcon: {
    fontSize: 24,
  },
  friendsBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff0000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  friendsBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  profileModalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 20,
    minHeight: 300,
  },
  profileModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  profileModalCloseButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileModalCloseText: {
    fontSize: 24,
    color: "#ffffff",
  },
  profileInfoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileAvatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileModalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#7db2ff",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#6a0dad",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7db2ff",
  },
  changePhotoIcon: {
    fontSize: 18,
  },
  profileModalName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  profileModalStatus: {
    fontSize: 16,
    color: "#7db2ff",
  },
  profileLogoutButton: {
    backgroundColor: "#6a0dad",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7db2ff",
  },
  profileLogoutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: "#7db2ff",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#7db2ff",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#25003d",
  },
  avatarBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  webMapText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#7db2ff",
    overflow: "hidden",
  },
  friendMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#6a0dad",
    overflow: "hidden",
  },
  markerAvatar: {
    width: "100%",
    height: "100%",
  },
  placeMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeMarkerIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  barMarker: {
    backgroundColor: "#4CAF50",
    borderColor: "#ffffff",
  },
  baladaMarker: {
    backgroundColor: "#9C27B0",
    borderColor: "#ffffff",
  },
  placeMarkerEmoji: {
    fontSize: 24,
  },
  eventMarker: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  eventMarkerPulse: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF9800",
    opacity: 0.3,
  },
  eventMarkerRing: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF6B00",
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  eventMarkerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFD700",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  eventMarkerEmoji: {
    fontSize: 36,
  },
  returnLocationButton: {
    position: "absolute",
    bottom: 160,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7db2ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  returnLocationIcon: {
    fontSize: 24,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6a0dad",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },
  searchResultsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 140 : 120,
    left: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    zIndex: 5,
    maxHeight: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchResultsScroll: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  pinIcon: {
    fontSize: 20,
  },
  searchResultIconText: {
    fontSize: 18,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: "#666666",
  },
});
