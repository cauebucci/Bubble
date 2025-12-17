// Serviço de busca de lugares usando Google Places API

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "YOUR_GOOGLE_PLACES_API_KEY";

export interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: "place" | "search";
  lat?: number;
  lon?: number;
}

export const placesAPI = {
  // Buscar lugares e sugestões
  searchPlaces: async (query: string, location?: { lat: number; lng: number }): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      // Usar Google Places Autocomplete API
      const locationBias = location 
        ? `&location=${location.lat},${location.lng}&radius=50000`
        : "";

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&language=pt-BR&components=country:br${locationBias}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.predictions) {
        return data.predictions.map((prediction: PlaceResult) => ({
          id: prediction.place_id,
          name: prediction.structured_formatting.main_text,
          address: prediction.structured_formatting.secondary_text,
          type: "place" as const,
        }));
      }

      // Fallback: gerar resultados mock se API não estiver configurada
      if (data.status === "REQUEST_DENIED" || GOOGLE_PLACES_API_KEY === "YOUR_GOOGLE_PLACES_API_KEY") {
        return generateMockResults(query);
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar lugares:", error);
      // Retornar resultados mock em caso de erro
      return generateMockResults(query);
    }
  },

  // Obter detalhes de um lugar pelo place_id
  getPlaceDetails: async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result?.geometry?.location) {
        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
      }

      return null;
    } catch (error) {
      console.error("Erro ao obter detalhes do lugar:", error);
      return null;
    }
  },
};

// Bares e baladas principais de São Paulo
export const SP_BARS_AND_CLUBS: Array<{
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "bar" | "balada";
}> = [
  // Bares

  {
    name: "Veloso",
    address: "R. Conceição Veloso, 54 - Vila Mariana, São Paulo - SP, 04110-120",
    lat: -23.5852067,
    lng: -46.6351298,
    type: "bar",
  },
  
];

// Gerar resultados mock para desenvolvimento
function generateMockResults(query: string): SearchResult[] {
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  // Filtrar bares e baladas que correspondem à busca
  const matchingPlaces = SP_BARS_AND_CLUBS.filter(
    (place) =>
      place.name.toLowerCase().includes(queryLower) ||
      place.address.toLowerCase().includes(queryLower)
  );

  // Se não encontrar correspondências exatas, mostrar alguns lugares principais
  const placesToShow = matchingPlaces.length > 0 
    ? matchingPlaces.slice(0, 5)
    : SP_BARS_AND_CLUBS.slice(0, 5);

  placesToShow.forEach((place, index) => {
    results.push({
      id: `place_${index}`,
      name: place.name,
      address: place.address,
      type: "place",
      lat: place.lat,
      lon: place.lng,
    });
  });

  // Resultados de pesquisa geral (com ícone de lupa)
  const mockSearches = [
    {
      name: `${queryLower} fotos`,
      address: "Pesquisar fotos",
    },
    {
      name: `${queryLower} avaliações`,
      address: "Ver avaliações",
    },
  ];

  mockSearches.forEach((search, index) => {
    results.push({
      id: `search_${index}`,
      name: search.name,
      address: search.address,
      type: "search",
    });
  });

  return results;
}
