/**
 * Currency conversion utilities
 * Uses free exchangerate-api.com endpoint
 */

import { CurrencyInfo } from "@/types";

// Common currencies with their info
export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "\u20AC", name: "Euro" },
  GBP: { symbol: "\u00A3", name: "British Pound" },
  JPY: { symbol: "\u00A5", name: "Japanese Yen" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  CAD: { symbol: "C$", name: "Canadian Dollar" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  CNY: { symbol: "\u00A5", name: "Chinese Yuan" },
  INR: { symbol: "\u20B9", name: "Indian Rupee" },
  MXN: { symbol: "$", name: "Mexican Peso" },
  BRL: { symbol: "R$", name: "Brazilian Real" },
  KRW: { symbol: "\u20A9", name: "South Korean Won" },
  SGD: { symbol: "S$", name: "Singapore Dollar" },
  HKD: { symbol: "HK$", name: "Hong Kong Dollar" },
  THB: { symbol: "\u0E3F", name: "Thai Baht" },
  PHP: { symbol: "\u20B1", name: "Philippine Peso" },
  IDR: { symbol: "Rp", name: "Indonesian Rupiah" },
  MYR: { symbol: "RM", name: "Malaysian Ringgit" },
  VND: { symbol: "\u20AB", name: "Vietnamese Dong" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar" },
  AED: { symbol: "\u062F.\u0625", name: "UAE Dirham" },
  SAR: { symbol: "\uFDFC", name: "Saudi Riyal" },
  ZAR: { symbol: "R", name: "South African Rand" },
  SEK: { symbol: "kr", name: "Swedish Krona" },
  NOK: { symbol: "kr", name: "Norwegian Krone" },
  DKK: { symbol: "kr", name: "Danish Krone" },
  PLN: { symbol: "z\u0142", name: "Polish Zloty" },
  CZK: { symbol: "K\u010D", name: "Czech Koruna" },
  HUF: { symbol: "Ft", name: "Hungarian Forint" },
  TRY: { symbol: "\u20BA", name: "Turkish Lira" },
  ILS: { symbol: "\u20AA", name: "Israeli Shekel" },
  EGP: { symbol: "\u00A3", name: "Egyptian Pound" },
  ARS: { symbol: "$", name: "Argentine Peso" },
  CLP: { symbol: "$", name: "Chilean Peso" },
  COP: { symbol: "$", name: "Colombian Peso" },
  PEN: { symbol: "S/", name: "Peruvian Sol" },
  PYG: { symbol: "\u20B2", name: "Paraguayan Guarani" },
  UYU: { symbol: "$U", name: "Uruguayan Peso" },
};

// City to currency code mapping (common destinations)
export const CITY_CURRENCIES: Record<string, string> = {
  // Americas
  "new york": "USD", "los angeles": "USD", "miami": "USD", "chicago": "USD", "las vegas": "USD",
  "san francisco": "USD", "seattle": "USD", "boston": "USD", "washington": "USD", "hawaii": "USD",
  "toronto": "CAD", "vancouver": "CAD", "montreal": "CAD",
  "mexico city": "MXN", "cancun": "MXN", "guadalajara": "MXN",
  "sao paulo": "BRL", "rio de janeiro": "BRL",
  "buenos aires": "ARS", "lima": "PEN", "bogota": "COP", "santiago": "CLP",
  "asuncion": "PYG", "montevideo": "UYU",

  // Europe
  "paris": "EUR", "rome": "EUR", "barcelona": "EUR", "madrid": "EUR", "amsterdam": "EUR",
  "berlin": "EUR", "munich": "EUR", "vienna": "EUR", "prague": "CZK", "budapest": "HUF",
  "athens": "EUR", "lisbon": "EUR", "dublin": "EUR", "brussels": "EUR", "milan": "EUR",
  "florence": "EUR", "venice": "EUR", "nice": "EUR", "marseille": "EUR",
  "london": "GBP", "edinburgh": "GBP", "manchester": "GBP",
  "zurich": "CHF", "geneva": "CHF",
  "stockholm": "SEK", "copenhagen": "DKK", "oslo": "NOK", "helsinki": "EUR",
  "warsaw": "PLN", "krakow": "PLN",
  "istanbul": "TRY",

  // Asia
  "tokyo": "JPY", "osaka": "JPY", "kyoto": "JPY",
  "seoul": "KRW", "busan": "KRW",
  "beijing": "CNY", "shanghai": "CNY", "hong kong": "HKD",
  "singapore": "SGD",
  "bangkok": "THB", "phuket": "THB", "chiang mai": "THB",
  "kuala lumpur": "MYR",
  "bali": "IDR", "jakarta": "IDR",
  "manila": "PHP",
  "ho chi minh": "VND", "hanoi": "VND",
  "mumbai": "INR", "delhi": "INR", "goa": "INR",
  "tel aviv": "ILS", "jerusalem": "ILS",
  "dubai": "AED", "abu dhabi": "AED",

  // Oceania
  "sydney": "AUD", "melbourne": "AUD", "brisbane": "AUD", "perth": "AUD",
  "auckland": "NZD", "queenstown": "NZD",

  // Africa
  "cape town": "ZAR", "johannesburg": "ZAR",
  "cairo": "EGP", "marrakech": "MAD",
};

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Fetch exchange rates (cached for 1 hour)
 */
async function fetchRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - cacheTimestamp < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Using exchangerate-api.com free tier (no API key needed for basic rates)
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data: ExchangeRateResponse = await response.json();
    cachedRates = data.rates;
    cacheTimestamp = now;
    return cachedRates;
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    return cachedRates || {};
  }
}

/**
 * Get currency code for a city
 */
export function getCurrencyForCity(city: string): string {
  const normalizedCity = city.toLowerCase().trim();
  return CITY_CURRENCIES[normalizedCity] || "USD";
}

/**
 * Get currency info for a city
 */
export async function getCurrencyInfo(city: string): Promise<CurrencyInfo | null> {
  const code = getCurrencyForCity(city);
  const currencyData = CURRENCIES[code];

  if (!currencyData) return null;

  const rates = await fetchRates();
  const rate = rates[code] || 1;

  return {
    code,
    symbol: currencyData.symbol,
    name: currencyData.name,
    rate,
  };
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const rates = await fetchRates();
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currencyCode === "JPY" || currencyCode === "KRW" ? 0 : 2,
    maximumFractionDigits: currencyCode === "JPY" || currencyCode === "KRW" ? 0 : 2,
  }).format(amount);

  return `${currency?.symbol || ""}${formatted}`;
}
