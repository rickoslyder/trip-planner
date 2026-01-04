/**
 * Deep link utilities for transport and navigation apps
 */

export interface DeepLinkParams {
  address: string;
  lat?: number;
  lng?: number;
  name?: string;
}

/**
 * Generate Uber deep link
 * Uses universal link that works on web/iOS/Android
 */
export function getUberLink(params: DeepLinkParams): string {
  const { address, lat, lng } = params;
  const baseUrl = "https://m.uber.com/ul/";

  const queryParams = new URLSearchParams({
    action: "setPickup",
    "pickup[latitude]": "my_location",
    "pickup[longitude]": "my_location",
    "pickup[nickname]": "Current Location",
  });

  if (lat && lng) {
    queryParams.set("dropoff[latitude]", lat.toString());
    queryParams.set("dropoff[longitude]", lng.toString());
  }
  queryParams.set("dropoff[formatted_address]", address);

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generate Lyft deep link
 */
export function getLyftLink(params: DeepLinkParams): string {
  const { lat, lng } = params;
  const baseUrl = "https://lyft.com/ride";

  const queryParams = new URLSearchParams({
    id: "lyft",
  });

  if (lat && lng) {
    queryParams.set("destination[latitude]", lat.toString());
    queryParams.set("destination[longitude]", lng.toString());
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generate Google Maps directions link
 */
export function getGoogleMapsLink(params: DeepLinkParams): string {
  const { address, lat, lng } = params;
  const baseUrl = "https://www.google.com/maps/dir/";

  const queryParams = new URLSearchParams({
    api: "1",
    travelmode: "driving",
  });

  if (lat && lng) {
    queryParams.set("destination", `${lat},${lng}`);
  } else {
    queryParams.set("destination", address);
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generate Apple Maps directions link
 */
export function getAppleMapsLink(params: DeepLinkParams): string {
  const { address, lat, lng } = params;

  const queryParams = new URLSearchParams({
    dirflg: "d", // driving directions
  });

  if (lat && lng) {
    queryParams.set("daddr", `${lat},${lng}`);
  } else {
    queryParams.set("daddr", address);
  }

  return `https://maps.apple.com/?${queryParams.toString()}`;
}

/**
 * Generate Waze navigation link
 */
export function getWazeLink(params: DeepLinkParams): string {
  const { address, lat, lng } = params;
  const baseUrl = "https://waze.com/ul";

  const queryParams = new URLSearchParams({
    navigate: "yes",
  });

  if (lat && lng) {
    queryParams.set("ll", `${lat},${lng}`);
  } else {
    queryParams.set("q", address);
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Detect if user is on iOS
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Get best maps link based on platform
 */
export function getSmartMapsLink(params: DeepLinkParams): string {
  return isIOS() ? getAppleMapsLink(params) : getGoogleMapsLink(params);
}
