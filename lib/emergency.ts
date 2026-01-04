/**
 * Emergency contact information by country
 * Static database - no API needed
 */

import { EmergencyInfo } from "@/types";

// Comprehensive emergency numbers database
const EMERGENCY_DATA: Record<string, EmergencyInfo> = {
  // Americas
  "united states": { country: "United States", police: "911", ambulance: "911", fire: "911", emergencyNumber: "911" },
  "usa": { country: "United States", police: "911", ambulance: "911", fire: "911", emergencyNumber: "911" },
  "canada": { country: "Canada", police: "911", ambulance: "911", fire: "911", emergencyNumber: "911" },
  "mexico": { country: "Mexico", police: "911", ambulance: "911", fire: "911", emergencyNumber: "911" },
  "brazil": { country: "Brazil", police: "190", ambulance: "192", fire: "193", emergencyNumber: "190" },
  "argentina": { country: "Argentina", police: "911", ambulance: "107", fire: "100", emergencyNumber: "911" },
  "chile": { country: "Chile", police: "133", ambulance: "131", fire: "132", emergencyNumber: "131" },
  "colombia": { country: "Colombia", police: "123", ambulance: "123", fire: "123", emergencyNumber: "123" },
  "peru": { country: "Peru", police: "105", ambulance: "117", fire: "116", emergencyNumber: "105" },
  "paraguay": { country: "Paraguay", police: "911", ambulance: "911", fire: "911", emergencyNumber: "911" },
  "uruguay": { country: "Uruguay", police: "911", ambulance: "911", fire: "911", emergencyNumber: "911" },

  // Europe (112 is universal EU emergency)
  "united kingdom": { country: "United Kingdom", police: "999", ambulance: "999", fire: "999", emergencyNumber: "999" },
  "uk": { country: "United Kingdom", police: "999", ambulance: "999", fire: "999", emergencyNumber: "999" },
  "england": { country: "United Kingdom", police: "999", ambulance: "999", fire: "999", emergencyNumber: "999" },
  "france": { country: "France", police: "17", ambulance: "15", fire: "18", emergencyNumber: "112" },
  "germany": { country: "Germany", police: "110", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "italy": { country: "Italy", police: "113", ambulance: "118", fire: "115", emergencyNumber: "112" },
  "spain": { country: "Spain", police: "091", ambulance: "061", fire: "080", emergencyNumber: "112" },
  "portugal": { country: "Portugal", police: "112", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "netherlands": { country: "Netherlands", police: "112", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "belgium": { country: "Belgium", police: "101", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "switzerland": { country: "Switzerland", police: "117", ambulance: "144", fire: "118", emergencyNumber: "112" },
  "austria": { country: "Austria", police: "133", ambulance: "144", fire: "122", emergencyNumber: "112" },
  "greece": { country: "Greece", police: "100", ambulance: "166", fire: "199", emergencyNumber: "112" },
  "ireland": { country: "Ireland", police: "999", ambulance: "999", fire: "999", emergencyNumber: "112" },
  "sweden": { country: "Sweden", police: "112", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "norway": { country: "Norway", police: "112", ambulance: "113", fire: "110", emergencyNumber: "112" },
  "denmark": { country: "Denmark", police: "112", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "finland": { country: "Finland", police: "112", ambulance: "112", fire: "112", emergencyNumber: "112" },
  "poland": { country: "Poland", police: "997", ambulance: "999", fire: "998", emergencyNumber: "112" },
  "czech republic": { country: "Czech Republic", police: "158", ambulance: "155", fire: "150", emergencyNumber: "112" },
  "czechia": { country: "Czech Republic", police: "158", ambulance: "155", fire: "150", emergencyNumber: "112" },
  "hungary": { country: "Hungary", police: "107", ambulance: "104", fire: "105", emergencyNumber: "112" },
  "turkey": { country: "Turkey", police: "155", ambulance: "112", fire: "110", emergencyNumber: "112" },
  "russia": { country: "Russia", police: "102", ambulance: "103", fire: "101", emergencyNumber: "112" },

  // Asia
  "japan": { country: "Japan", police: "110", ambulance: "119", fire: "119", emergencyNumber: "110" },
  "south korea": { country: "South Korea", police: "112", ambulance: "119", fire: "119", emergencyNumber: "112" },
  "korea": { country: "South Korea", police: "112", ambulance: "119", fire: "119", emergencyNumber: "112" },
  "china": { country: "China", police: "110", ambulance: "120", fire: "119", emergencyNumber: "110" },
  "hong kong": { country: "Hong Kong", police: "999", ambulance: "999", fire: "999", emergencyNumber: "999" },
  "taiwan": { country: "Taiwan", police: "110", ambulance: "119", fire: "119", emergencyNumber: "110" },
  "singapore": { country: "Singapore", police: "999", ambulance: "995", fire: "995", emergencyNumber: "999" },
  "thailand": { country: "Thailand", police: "191", ambulance: "1669", fire: "199", emergencyNumber: "191" },
  "vietnam": { country: "Vietnam", police: "113", ambulance: "115", fire: "114", emergencyNumber: "113" },
  "indonesia": { country: "Indonesia", police: "110", ambulance: "118", fire: "113", emergencyNumber: "112" },
  "malaysia": { country: "Malaysia", police: "999", ambulance: "999", fire: "994", emergencyNumber: "999" },
  "philippines": { country: "Philippines", police: "117", ambulance: "911", fire: "911", emergencyNumber: "911" },
  "india": { country: "India", police: "100", ambulance: "102", fire: "101", emergencyNumber: "112" },
  "israel": { country: "Israel", police: "100", ambulance: "101", fire: "102", emergencyNumber: "100" },
  "uae": { country: "UAE", police: "999", ambulance: "998", fire: "997", emergencyNumber: "999" },
  "dubai": { country: "UAE", police: "999", ambulance: "998", fire: "997", emergencyNumber: "999" },
  "saudi arabia": { country: "Saudi Arabia", police: "999", ambulance: "997", fire: "998", emergencyNumber: "911" },

  // Oceania
  "australia": { country: "Australia", police: "000", ambulance: "000", fire: "000", emergencyNumber: "000" },
  "new zealand": { country: "New Zealand", police: "111", ambulance: "111", fire: "111", emergencyNumber: "111" },

  // Africa
  "south africa": { country: "South Africa", police: "10111", ambulance: "10177", fire: "10111", emergencyNumber: "112" },
  "egypt": { country: "Egypt", police: "122", ambulance: "123", fire: "180", emergencyNumber: "122" },
  "morocco": { country: "Morocco", police: "19", ambulance: "15", fire: "15", emergencyNumber: "19" },
  "kenya": { country: "Kenya", police: "999", ambulance: "999", fire: "999", emergencyNumber: "999" },
};

// City to country mapping
const CITY_COUNTRIES: Record<string, string> = {
  // Americas
  "new york": "united states", "los angeles": "united states", "miami": "united states",
  "chicago": "united states", "las vegas": "united states", "san francisco": "united states",
  "seattle": "united states", "boston": "united states", "washington": "united states",
  "hawaii": "united states", "honolulu": "united states",
  "toronto": "canada", "vancouver": "canada", "montreal": "canada",
  "mexico city": "mexico", "cancun": "mexico", "guadalajara": "mexico",
  "sao paulo": "brazil", "rio de janeiro": "brazil",
  "buenos aires": "argentina", "lima": "peru", "bogota": "colombia", "santiago": "chile",
  "asuncion": "paraguay", "montevideo": "uruguay",

  // Europe
  "london": "united kingdom", "edinburgh": "united kingdom", "manchester": "united kingdom",
  "paris": "france", "nice": "france", "marseille": "france", "lyon": "france",
  "rome": "italy", "milan": "italy", "florence": "italy", "venice": "italy", "naples": "italy",
  "barcelona": "spain", "madrid": "spain", "seville": "spain", "valencia": "spain",
  "lisbon": "portugal", "porto": "portugal",
  "berlin": "germany", "munich": "germany", "frankfurt": "germany", "hamburg": "germany",
  "amsterdam": "netherlands", "rotterdam": "netherlands",
  "brussels": "belgium", "bruges": "belgium",
  "vienna": "austria", "salzburg": "austria",
  "zurich": "switzerland", "geneva": "switzerland", "bern": "switzerland",
  "athens": "greece", "santorini": "greece", "mykonos": "greece",
  "dublin": "ireland",
  "stockholm": "sweden", "copenhagen": "denmark", "oslo": "norway", "helsinki": "finland",
  "prague": "czech republic", "budapest": "hungary", "warsaw": "poland", "krakow": "poland",
  "istanbul": "turkey",
  "moscow": "russia", "st petersburg": "russia",

  // Asia
  "tokyo": "japan", "osaka": "japan", "kyoto": "japan",
  "seoul": "south korea", "busan": "south korea",
  "beijing": "china", "shanghai": "china", "hong kong": "hong kong",
  "taipei": "taiwan",
  "singapore": "singapore",
  "bangkok": "thailand", "phuket": "thailand", "chiang mai": "thailand",
  "kuala lumpur": "malaysia",
  "bali": "indonesia", "jakarta": "indonesia",
  "manila": "philippines", "cebu": "philippines",
  "ho chi minh": "vietnam", "hanoi": "vietnam",
  "mumbai": "india", "delhi": "india", "goa": "india", "jaipur": "india",
  "tel aviv": "israel", "jerusalem": "israel",
  "dubai": "uae", "abu dhabi": "uae",
  "riyadh": "saudi arabia",

  // Oceania
  "sydney": "australia", "melbourne": "australia", "brisbane": "australia", "perth": "australia",
  "auckland": "new zealand", "queenstown": "new zealand",

  // Africa
  "cape town": "south africa", "johannesburg": "south africa",
  "cairo": "egypt", "marrakech": "morocco", "nairobi": "kenya",
};

/**
 * Get emergency info for a city
 */
export function getEmergencyInfo(city: string): EmergencyInfo | null {
  const normalizedCity = city.toLowerCase().trim();

  // First try to find the country from the city
  const country = CITY_COUNTRIES[normalizedCity];
  if (country && EMERGENCY_DATA[country]) {
    return EMERGENCY_DATA[country];
  }

  // Try treating the input as a country name
  if (EMERGENCY_DATA[normalizedCity]) {
    return EMERGENCY_DATA[normalizedCity];
  }

  // Default fallback - most countries use 112 as emergency number
  return {
    country: "Unknown",
    police: "112",
    ambulance: "112",
    fire: "112",
    emergencyNumber: "112",
  };
}

/**
 * Get country from city name
 */
export function getCountryFromCity(city: string): string {
  const normalizedCity = city.toLowerCase().trim();
  const country = CITY_COUNTRIES[normalizedCity];
  return country ? country.charAt(0).toUpperCase() + country.slice(1) : "Unknown";
}
