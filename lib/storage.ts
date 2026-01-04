/**
 * Local storage utilities for saving/loading trips
 */

import { SavedTrip, ItineraryStep, ChecklistItem, TripStyle } from "@/types";

const STORAGE_KEY = "trip-planner-saved-trips";
const CURRENT_TRIP_KEY = "trip-planner-current";

/**
 * Generate unique ID for a trip
 */
function generateId(): string {
  return `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved trips
 */
export function getSavedTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new trip
 */
export function saveTrip(
  city: string,
  basecamp: string,
  style: TripStyle,
  itinerary: ItineraryStep[],
  checklist: ChecklistItem[]
): SavedTrip {
  const trips = getSavedTrips();
  const now = new Date().toISOString();

  const newTrip: SavedTrip = {
    id: generateId(),
    city,
    basecamp,
    style,
    itinerary,
    checklist,
    createdAt: now,
    updatedAt: now,
  };

  trips.unshift(newTrip); // Add to beginning

  // Keep only last 10 trips
  const trimmedTrips = trips.slice(0, 10);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedTrips));
  return newTrip;
}

/**
 * Update an existing trip
 */
export function updateTrip(
  id: string,
  updates: Partial<Pick<SavedTrip, "itinerary" | "checklist">>
): SavedTrip | null {
  const trips = getSavedTrips();
  const index = trips.findIndex(t => t.id === id);

  if (index === -1) return null;

  trips[index] = {
    ...trips[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  return trips[index];
}

/**
 * Delete a saved trip
 */
export function deleteTrip(id: string): boolean {
  const trips = getSavedTrips();
  const filtered = trips.filter(t => t.id !== id);

  if (filtered.length === trips.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get a specific trip by ID
 */
export function getTripById(id: string): SavedTrip | null {
  const trips = getSavedTrips();
  return trips.find(t => t.id === id) || null;
}

/**
 * Save current trip state (for recovery on page reload)
 */
export function saveCurrentTrip(
  city: string,
  basecamp: string,
  style: TripStyle,
  itinerary: ItineraryStep[],
  checklist: ChecklistItem[]
): void {
  if (typeof window === "undefined") return;

  const data = {
    city,
    basecamp,
    style,
    itinerary,
    checklist,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(CURRENT_TRIP_KEY, JSON.stringify(data));
}

/**
 * Load current trip state
 */
export function loadCurrentTrip(): {
  city: string;
  basecamp: string;
  style: TripStyle;
  itinerary: ItineraryStep[];
  checklist: ChecklistItem[];
} | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(CURRENT_TRIP_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Clear current trip state
 */
export function clearCurrentTrip(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_TRIP_KEY);
}
