import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Função para obter a URL base da API a partir das variáveis de ambiente
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Em desenvolvimento
    if (Platform.OS === "android") {
      // Para emulador Android, usar variável de ambiente ou fallback
      return process.env.API_BASE_URL_DEVELOPMENT_ANDROID || "http://10.0.2.2:3000";
    }
    // iOS simulador pode usar localhost
    // Para dispositivo físico iOS, use o IP da sua máquina
    return process.env.API_BASE_URL_DEVELOPMENT_IOS || "https://backend-tyua5rg3pq-ue.a.run.app";
  }
  // Em produção, usar a URL real da API
  return process.env.API_BASE_URL_PRODUCTION || "https://backend-tyua5rg3pq-ue.a.run.app";
};

const API_BASE_URL = getApiBaseUrl();

// Tipos
export interface LoginRequest {
  email: string;
  pass: string;
}

export interface LoginResponse {
  token: string;
  [key: string]: any;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface CreateUserResponse {
  [key: string]: any;
}

// Classe de erro para Unauthorized (401)
export class UnauthorizedError extends Error {
  constructor(message: string = "Não autorizado. Por favor, faça login novamente.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// Função auxiliar para fazer requisições
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Adicionar token de autenticação se existir
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log("API Request:", url, config.method);
    if (config.body) {
      try {
        const bodyObj = JSON.parse(config.body as string);
        console.log("API Request Body:", JSON.stringify(bodyObj, null, 2));
      } catch {
        console.log("API Request Body:", config.body);
      }
    }
    
    const response = await fetch(url, config);
    
    const responseText = await response.text();
    console.log("API Response Status:", response.status);
    console.log("API Response Body:", responseText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = {
          message: `Erro ${response.status}: ${response.statusText}`,
        };
      }
      
      // Se for erro 401 (Unauthorized), verificar se é erro de autenticação ou autorização
      if (response.status === 401) {
        const errorMessage = (errorData.message || errorData.error || "").toLowerCase();
        
        // Erros de autorização (sem permissão) não devem fazer logout
        const authorizationErrors = [
          "only the event owner",
          "only the owner",
          "not authorized",
          "permission denied",
          "forbidden",
          "sem permissão",
          "não autorizado",
        ];
        
        const isAuthorizationError = authorizationErrors.some(msg => 
          errorMessage.includes(msg)
        );
        
        if (isAuthorizationError) {
          // É um erro de autorização, não de autenticação
          // Apenas lançar o erro sem fazer logout
          throw new Error(errorData.message || errorData.error || "Você não tem permissão para realizar esta ação.");
        } else {
          // É um erro de autenticação (token inválido/expirado)
          // Fazer logout removendo o token
          await AsyncStorage.removeItem("userToken");
          console.log("Token removido devido a erro 401 (Unauthorized)");
          // Lançar erro especial para que o componente possa redirecionar
          throw new UnauthorizedError("Sua sessão expirou. Por favor, faça login novamente.");
        }
      }
      
      // Mensagens de erro mais específicas
      let errorMessage = errorData.message || errorData.error || errorData.error?.message || "Erro na requisição";
      
      // Se for erro 500, adicionar mais contexto
      if (response.status === 500) {
        errorMessage = `Erro interno do servidor: ${errorMessage}. Verifique os logs do servidor ou tente novamente.`;
      }
      
      // Traduzir mensagens comuns
      if (errorMessage.toLowerCase().includes("user not found") || 
          errorMessage.toLowerCase().includes("usuário não encontrado") ||
          errorMessage.toLowerCase().includes("user not found")) {
        errorMessage = "Usuário não encontrado. Verifique seu email e senha.";
      } else if (errorMessage.toLowerCase().includes("invalid") || 
                 errorMessage.toLowerCase().includes("incorrect") ||
                 errorMessage.toLowerCase().includes("incorreto")) {
        errorMessage = "Email ou senha incorretos. Tente novamente.";
      } else if (errorMessage.toLowerCase().includes("validation") ||
                 errorMessage.toLowerCase().includes("validação")) {
        errorMessage = `Erro de validação: ${errorMessage}`;
      }
      
      throw new Error(errorMessage);
    }

    return JSON.parse(responseText);
  } catch (error) {
    if (error instanceof Error) {
      // Melhorar mensagem de erro para problemas de rede
      if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
        throw new Error("Não foi possível conectar à API. Verifique se o servidor está rodando e se a URL está correta.");
      }
      throw error;
    }
    throw new Error("Erro desconhecido na requisição");
  }
}

// API de Autenticação
export const authAPI = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await request<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    // Salvar token automaticamente
    if (response.token) {
      await AsyncStorage.setItem("userToken", response.token);
    }
    
    return response;
  },

  // Logout
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem("userToken");
  },

  // Obter token atual
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem("userToken");
  },
};

// API de Usuários
export const userAPI = {
  // Criar usuário
  create: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    return await request<CreateUserResponse>("/v1/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Obter dados do usuário logado
  getMe: async (): Promise<any> => {
    return await request<any>("/v1/users/me", {
      method: "GET",
    });
  },

  // Atualizar dados do usuário
  updateMe: async (data: any): Promise<any> => {
    return await request<any>("/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Buscar amigos
  getFriends: async (): Promise<any[]> => {
    return await request<any[]>("/v1/users/me/friends", {
      method: "GET",
    });
  },

  // Adicionar amigo
  addFriend: async (friendId: string): Promise<any> => {
    return await request<any>("/v1/users/me/friends", {
      method: "POST",
      body: JSON.stringify({ friendId }),
    });
  },

  // Remover amigo
  removeFriend: async (friendId: string): Promise<any> => {
    return await request<any>(`/v1/users/me/friends/${friendId}`, {
      method: "DELETE",
    });
  },
};

// API de Eventos
export const eventsAPI = {
  // Listar eventos
  getEvents: async (): Promise<any[]> => {
    return await request<any[]>("/v1/events", {
      method: "GET",
    });
  },

  // Criar evento
  createEvent: async (eventData: {
    name: string;
    address: string;
    lat: number;
    lon: number;
    startsAt: string;
    endsAt: string;
  }): Promise<any> => {
    return await request<any>("/v1/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  // Obter evento específico
  getEvent: async (eventId: string): Promise<any> => {
    return await request<any>(`/v1/events/${eventId}`, {
      method: "GET",
    });
  },

  // Fazer check-in
  checkIn: async (eventId: string, lat: number, lon: number): Promise<any> => {
    return await request<any>(`/v1/events/${eventId}/checkin`, {
      method: "POST",
      body: JSON.stringify({ lat, lon }),
    });
  },

  // Fazer check-out
  checkOut: async (eventId: string, lat: number, lon: number): Promise<any> => {
    return await request<any>(`/v1/events/${eventId}/checkout`, {
      method: "POST",
      body: JSON.stringify({ lat, lon }),
    });
  },

  // Cancelar evento
  cancelEvent: async (eventId: string): Promise<any> => {
    return await request<any>(`/v1/events/${eventId}/cancel`, {
      method: "PATCH",
    });
  },

  // Adicionar presença (attendance)
  addAttendance: async (eventId: string, probability: number): Promise<any> => {
    return await request<any>(`/v1/events/${eventId}/attendance`, {
      method: "POST",
      body: JSON.stringify({ probability }),
    });
  },

  // Remover presença (attendance)
  removeAttendance: async (eventId: string): Promise<any> => {
    return await request<any>(`/v1/events/${eventId}/attendance`, {
      method: "DELETE",
    });
  },
};

export default {
  auth: authAPI,
  user: userAPI,
  events: eventsAPI,
};
