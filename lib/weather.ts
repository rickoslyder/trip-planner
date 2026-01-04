/**
 * Weather utilities using Open-Meteo API (free, no API key required)
 */

import { WeatherData } from "@/types";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  timezone: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

// Weather code to condition mapping
const WEATHER_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: "Clear sky", icon: "sun" },
  1: { condition: "Mainly clear", icon: "sun" },
  2: { condition: "Partly cloudy", icon: "cloud-sun" },
  3: { condition: "Overcast", icon: "cloud" },
  45: { condition: "Foggy", icon: "cloud-fog" },
  48: { condition: "Rime fog", icon: "cloud-fog" },
  51: { condition: "Light drizzle", icon: "cloud-drizzle" },
  53: { condition: "Drizzle", icon: "cloud-drizzle" },
  55: { condition: "Heavy drizzle", icon: "cloud-drizzle" },
  61: { condition: "Light rain", icon: "cloud-rain" },
  63: { condition: "Rain", icon: "cloud-rain" },
  65: { condition: "Heavy rain", icon: "cloud-rain" },
  71: { condition: "Light snow", icon: "snowflake" },
  73: { condition: "Snow", icon: "snowflake" },
  75: { condition: "Heavy snow", icon: "snowflake" },
  80: { condition: "Rain showers", icon: "cloud-rain" },
  81: { condition: "Rain showers", icon: "cloud-rain" },
  82: { condition: "Heavy showers", icon: "cloud-rain" },
  95: { condition: "Thunderstorm", icon: "cloud-lightning" },
  96: { condition: "Thunderstorm with hail", icon: "cloud-lightning" },
  99: { condition: "Thunderstorm with hail", icon: "cloud-lightning" },
};

/**
 * Get coordinates for a city using Open-Meteo Geocoding API
 */
export async function getCoordinates(city: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country,
        timezone: result.timezone,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Fetch weather data for a city
 */
export async function fetchWeather(city: string): Promise<WeatherData | null> {
  try {
    const coords = await getCoordinates(city);
    if (!coords) return null;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
    );

    const data: OpenMeteoResponse = await response.json();
    const weatherInfo = WEATHER_CODES[data.current.weather_code] || { condition: "Unknown", icon: "cloud" };

    return {
      temperature: Math.round(data.current.temperature_2m),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      forecast: data.daily.time.slice(0, 5).map((date, i) => ({
        date,
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        condition: WEATHER_CODES[data.daily.weather_code[i]]?.condition || "Unknown",
      })),
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}

/**
 * Get timezone for a city
 */
export async function getTimezone(city: string): Promise<string | null> {
  const coords = await getCoordinates(city);
  return coords?.timezone || null;
}

/**
 * Get current time in a timezone
 */
export function getLocalTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "";
  }
}

/**
 * Get time difference from local timezone
 */
export function getTimeDifference(timezone: string): string {
  try {
    const now = new Date();
    const localOffset = now.getTimezoneOffset();
    const targetTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const targetOffset = (now.getTime() - targetTime.getTime()) / 60000 + localOffset;

    const hours = Math.round(targetOffset / 60);
    if (hours === 0) return "Same time";
    return hours > 0 ? `${hours}h behind` : `${Math.abs(hours)}h ahead`;
  } catch {
    return "";
  }
}
