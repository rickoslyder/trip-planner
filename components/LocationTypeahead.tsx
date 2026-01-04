"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    osm_value?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface Props {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  type: "city" | "address";
  biasLocation?: { lat: number; lng: number }; // For address search, bias towards city
  icon?: React.ReactNode;
  required?: boolean;
}

export default function LocationTypeahead({
  value,
  onChange,
  placeholder,
  type,
  biasLocation,
  icon,
  required,
}: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update query when value changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`;

      // Add location bias for address searches
      if (biasLocation) {
        url += `&lat=${biasLocation.lat}&lon=${biasLocation.lng}`;
      }

      // Filter by type for cities
      if (type === "city") {
        // Photon uses OSM tags - cities are typically place=city or place=town
        url += "&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village";
      }

      const response = await fetch(url);
      const data = await response.json();

      setSuggestions(data.features || []);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange(newQuery); // Update parent immediately for typing
    setShowSuggestions(true);

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  const formatSuggestion = (feature: PhotonFeature): string => {
    const props = feature.properties;

    if (type === "city") {
      const parts = [props.name];
      if (props.state) parts.push(props.state);
      if (props.country) parts.push(props.country);
      return parts.filter(Boolean).join(", ");
    } else {
      // Address format
      const parts = [];
      if (props.name) parts.push(props.name);
      if (props.street) {
        const street = props.housenumber
          ? `${props.housenumber} ${props.street}`
          : props.street;
        parts.push(street);
      }
      if (props.city) parts.push(props.city);
      return parts.filter(Boolean).join(", ");
    }
  };

  const handleSelectSuggestion = (feature: PhotonFeature) => {
    const displayText = formatSuggestion(feature);
    const [lng, lat] = feature.geometry.coordinates;

    setQuery(displayText);
    onChange(displayText, { lat, lng });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-3.5 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-white border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-700 outline-none shadow-sm transition-all ${
            icon ? "pl-10 pr-10" : "px-4 pr-10"
          }`}
        />
        <div className="absolute right-3 top-3 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((feature, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(feature)}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition ${
                index === selectedIndex
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{formatSuggestion(feature)}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-sm text-slate-500">
          No locations found. Try a different search.
        </div>
      )}
    </div>
  );
}
