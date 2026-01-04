"use client";

import { useState } from "react";
import { MapPin, Hotel, Landmark, Utensils, TreePine, Rocket, Sparkles } from "lucide-react";
import { TripStyle } from "@/types";
import LocationTypeahead from "@/components/LocationTypeahead";

interface Props {
  onGenerate: (city: string, basecamp: string, style: TripStyle, customStyle?: string) => void;
}

export default function SetupForm({ onGenerate }: Props) {
  const [city, setCity] = useState("");
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [basecamp, setBasecamp] = useState("");
  const [style, setStyle] = useState<TripStyle>("culture");
  const [customStyleText, setCustomStyleText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCityChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setCity(value);
    setCityCoords(coordinates);
  };

  const handleBasecampChange = (value: string) => {
    setBasecamp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !basecamp) return;
    if (style === "custom" && !customStyleText.trim()) return;

    setLoading(true);
    try {
      await onGenerate(
        city,
        basecamp,
        style,
        style === "custom" ? customStyleText : undefined
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = (newStyle: TripStyle) => {
    setStyle(newStyle);
    if (newStyle !== "custom") {
      setCustomStyleText("");
    }
  };

  return (
    <div className="h-full flex flex-col p-6 justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mb-8 text-center animate-float">
        <div className="w-20 h-20 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3">
          <Rocket className="w-10 h-10 text-white -rotate-3" />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">AI Trip Planner</h1>
      <p className="text-slate-500 text-center mb-8 text-sm">Powered by Gemini AI</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Destination City
          </label>
          <LocationTypeahead
            value={city}
            onChange={handleCityChange}
            placeholder="e.g. Tokyo, Rome, New York"
            type="city"
            icon={<MapPin className="w-4 h-4" />}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Base Camp
          </label>
          <LocationTypeahead
            value={basecamp}
            onChange={handleBasecampChange}
            placeholder="e.g. Hotel Esplendor, Airbnb Downtown"
            type="address"
            biasLocation={cityCoords}
            icon={<Hotel className="w-4 h-4" />}
            required
          />
          <p className="text-[10px] text-slate-400 mt-1 ml-1">
            Your hotel, Airbnb, or starting point
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Trip Style
          </label>
          <div className="grid grid-cols-4 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="style"
                value="culture"
                className="peer sr-only"
                checked={style === "culture"}
                onChange={() => handleStyleChange("culture")}
              />
              <div
                className={`p-3 rounded-xl border border-slate-200 bg-white text-center transition-all ${
                  style === "culture" ? "border-blue-700 bg-blue-50 text-blue-700" : ""
                }`}
              >
                <Landmark className="w-4 h-4 mb-1 mx-auto" />
                <span className="text-[10px] font-bold">Culture</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="style"
                value="food"
                className="peer sr-only"
                checked={style === "food"}
                onChange={() => handleStyleChange("food")}
              />
              <div
                className={`p-3 rounded-xl border border-slate-200 bg-white text-center transition-all ${
                  style === "food" ? "border-red-700 bg-red-50 text-red-700" : ""
                }`}
              >
                <Utensils className="w-4 h-4 mb-1 mx-auto" />
                <span className="text-[10px] font-bold">Food</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="style"
                value="nature"
                className="peer sr-only"
                checked={style === "nature"}
                onChange={() => handleStyleChange("nature")}
              />
              <div
                className={`p-3 rounded-xl border border-slate-200 bg-white text-center transition-all ${
                  style === "nature" ? "border-green-700 bg-green-50 text-green-700" : ""
                }`}
              >
                <TreePine className="w-4 h-4 mb-1 mx-auto" />
                <span className="text-[10px] font-bold">Nature</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="style"
                value="custom"
                className="peer sr-only"
                checked={style === "custom"}
                onChange={() => handleStyleChange("custom")}
              />
              <div
                className={`p-3 rounded-xl border border-slate-200 bg-white text-center transition-all ${
                  style === "custom" ? "border-purple-700 bg-purple-50 text-purple-700" : ""
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 mx-auto" />
                <span className="text-[10px] font-bold">Custom</span>
              </div>
            </label>
          </div>

          {/* Custom style input */}
          {style === "custom" && (
            <div className="mt-3">
              <textarea
                value={customStyleText}
                onChange={(e) => setCustomStyleText(e.target.value)}
                placeholder="Describe your ideal trip... e.g., 'romantic anniversary trip with wine tastings and sunset views' or 'kid-friendly adventure with theme parks and interactive museums'"
                className="w-full bg-white border border-purple-200 rounded-xl p-3 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm resize-none"
                rows={3}
                required={style === "custom"}
              />
              <p className="text-[10px] text-slate-400 mt-1 ml-1">
                Be specific about your interests, occasion, or travel companions
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || (style === "custom" && !customStyleText.trim())}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <span>Generate Itinerary</span>
                <Rocket className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
