export type TripStyle = 'culture' | 'food' | 'nature' | 'custom';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface ItineraryStep {
  id: number;
  time: string;
  title: string;
  description: string;
  image_keyword: string;
  address: string;
  coordinates?: Coordinate;
  stops: string[];
  color: string;
  imageUrl?: string;
  notes?: string; // User's personal notes
  travelTimeFromPrevious?: string; // e.g., "15 min drive"
}

// Full trip state for save/load
export interface SavedTrip {
  id: string;
  city: string;
  basecamp: string;
  style: TripStyle;
  itinerary: ItineraryStep[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// Weather data
export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

// Currency data
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate vs USD
}

// Emergency info
export interface EmergencyInfo {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  embassy?: string;
  emergencyNumber: string; // Universal emergency number
}

// API Request/Response types
export interface GenerateRequest {
  city: string;
  basecamp: string;
  style: TripStyle;
  customStyle?: string; // User's custom description for personalized itineraries
}

export interface GenerateResponse {
  success: boolean;
  data?: ItineraryStep[];
  error?: string;
}

export interface ChatRequest {
  city: string;
  basecamp: string;
  message: string;
  history: { role: string; parts: { text: string }[] }[];
  itinerary?: ItineraryStep[]; // Context about current trip
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}
