// Declaração de tipos para variáveis de ambiente
declare namespace NodeJS {
  interface ProcessEnv {
    API_BASE_URL_PRODUCTION?: string;
    API_BASE_URL_DEVELOPMENT_ANDROID?: string;
    API_BASE_URL_DEVELOPMENT_IOS?: string;
    GOOGLE_PLACES_API_KEY?: string;
  }
}

