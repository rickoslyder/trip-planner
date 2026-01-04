"use client";

import { useState, useEffect } from "react";
import { Rocket, Undo, Hotel, MapPin, MessageCircle } from "lucide-react";
import SetupForm from "@/components/SetupForm";
import ItineraryView from "@/components/ItineraryView";
import ChatModal from "@/components/ChatModal";
import WeatherWidget from "@/components/WeatherWidget";
import CurrencyWidget from "@/components/CurrencyWidget";
import EmergencyInfo from "@/components/EmergencyInfo";
import TripActions from "@/components/TripActions";
import SavedTripsModal from "@/components/SavedTripsModal";
import { useToast } from "@/components/Toast";
import { generateItinerary } from "@/lib/gemini";
import { fetchWeather, getTimezone } from "@/lib/weather";
import { getCurrencyInfo } from "@/lib/currency";
import { getEmergencyInfo } from "@/lib/emergency";
import { getSavedTrips, saveTrip, deleteTrip, saveCurrentTrip, loadCurrentTrip, clearCurrentTrip } from "@/lib/storage";
import { ItineraryStep, ChecklistItem, TripStyle, WeatherData, CurrencyInfo, EmergencyInfo as EmergencyInfoType, SavedTrip } from "@/types";

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 1, text: "Cash & Local Currency", done: false },
  { id: 2, text: "Offline Maps Download", done: false },
  { id: 3, text: "Sim Card / Roaming", done: false },
];

const LOADING_MESSAGES = [
  "Searching for locations...",
  "Verifying addresses...",
  "Finding the best spots...",
  "Planning your route...",
  "Fetching weather data...",
  "Almost ready...",
];

export default function Home() {
  const { toast } = useToast();
  const [view, setView] = useState<"setup" | "loading" | "itinerary">("setup");
  const [data, setData] = useState<ItineraryStep[]>([]);
  const [city, setCity] = useState("");
  const [basecamp, setBasecamp] = useState("");
  const [tripStyle, setTripStyle] = useState<TripStyle>("culture");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  // New state for widgets
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfoType | null>(null);

  // Saved trips
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [savedTripsOpen, setSavedTripsOpen] = useState(false);
  const [nextChecklistId, setNextChecklistId] = useState(4);

  // Load saved trips on mount
  useEffect(() => {
    setSavedTrips(getSavedTrips());

    // Try to restore current trip
    const current = loadCurrentTrip();
    if (current && current.itinerary.length > 0) {
      setCity(current.city);
      setBasecamp(current.basecamp);
      setTripStyle(current.style);
      setData(current.itinerary);
      setChecklist(current.checklist);
      setView("itinerary");

      // Fetch additional data
      fetchTripData(current.city);
    }
  }, []);

  // Auto-save current trip on changes
  useEffect(() => {
    if (view === "itinerary" && data.length > 0) {
      saveCurrentTrip(city, basecamp, tripStyle, data, checklist);
    }
  }, [view, city, basecamp, tripStyle, data, checklist]);

  // Cycle through loading messages
  useEffect(() => {
    if (view !== "loading") return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [view]);

  const fetchTripData = async (cityName: string) => {
    // Fetch weather
    const weatherData = await fetchWeather(cityName);
    setWeather(weatherData);

    // Get timezone
    const tz = await getTimezone(cityName);
    setTimezone(tz);

    // Get currency info
    const currency = await getCurrencyInfo(cityName);
    setCurrencyInfo(currency);

    // Get emergency info
    const emergency = getEmergencyInfo(cityName);
    setEmergencyInfo(emergency);
  };

  const handleGenerate = async (c: string, b: string, style: TripStyle, customStyle?: string) => {
    setCity(c);
    setBasecamp(b);
    setTripStyle(style);
    setView("loading");
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      // Start fetching trip data in parallel with itinerary
      fetchTripData(c);

      const result = await generateItinerary(c, b, style, customStyle);
      setData(result);
      setView("itinerary");
      toast.success("Itinerary generated!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to generate trip");
      setView("setup");
    }
  };

  const reset = () => {
    setData([]);
    setView("setup");
    setChatOpen(false);
    setChatKey((prev) => prev + 1);
    setChecklist(INITIAL_CHECKLIST);
    setNextChecklistId(4);
    setWeather(null);
    setTimezone(null);
    setCurrencyInfo(null);
    setEmergencyInfo(null);
    clearCurrentTrip();
  };

  // Checklist handlers
  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const addChecklistItem = (text: string) => {
    setChecklist((prev) => [...prev, { id: nextChecklistId, text, done: false }]);
    setNextChecklistId((prev) => prev + 1);
  };

  const removeChecklistItem = (id: number) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const resetChecklist = () => {
    setChecklist(INITIAL_CHECKLIST);
    setNextChecklistId(4);
  };

  // Stop handlers
  const updateStopNote = (stopId: number, note: string) => {
    setData((prev) =>
      prev.map((stop) => (stop.id === stopId ? { ...stop, notes: note } : stop))
    );
  };

  const reorderStop = (stopId: number, direction: "up" | "down") => {
    setData((prev) => {
      const index = prev.findIndex((stop) => stop.id === stopId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newData = [...prev];
      [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
      return newData;
    });
  };

  // Save trip handlers
  const handleSaveTrip = () => {
    saveTrip(city, basecamp, tripStyle, data, checklist);
    setSavedTrips(getSavedTrips());
  };

  const handleLoadTrip = (trip: SavedTrip) => {
    setCity(trip.city);
    setBasecamp(trip.basecamp);
    setTripStyle(trip.style);
    setData(trip.itinerary);
    setChecklist(trip.checklist);
    setView("itinerary");
    setChatKey((prev) => prev + 1);
    fetchTripData(trip.city);
  };

  const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId);
    setSavedTrips(getSavedTrips());
  };

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied!");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
      {/* Header */}
      {view !== "setup" && view !== "loading" && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200/50 px-5 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {city} <span className="text-blue-700">Trip</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              AI Generated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TripActions
              city={city}
              basecamp={basecamp}
              itinerary={data}
              checklist={checklist}
              onSaveTrip={handleSaveTrip}
              onOpenSavedTrips={() => setSavedTripsOpen(true)}
              hasSavedTrips={savedTrips.length > 0}
            />
            <button
              onClick={reset}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
            >
              <Undo size={14} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-50">
        {view === "setup" && (
          <>
            <SetupForm onGenerate={handleGenerate} />
            {savedTrips.length > 0 && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => setSavedTripsOpen(true)}
                  className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-xl hover:border-slate-400 transition"
                >
                  View {savedTrips.length} saved trip{savedTrips.length > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </>
        )}
        {view === "loading" && (
          <div className="h-full min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
              <Rocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-700 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Generating your trip...
            </h2>
            <p className="text-slate-500 text-sm animate-pulse">{loadingMessage}</p>
          </div>
        )}
        {view === "itinerary" && (
          <div className="px-4 pt-4">
            {/* Weather Widget */}
            <WeatherWidget weather={weather} city={city} timezone={timezone} />

            {/* Currency Widget */}
            <CurrencyWidget currencyInfo={currencyInfo} />

            {/* Emergency Info */}
            <EmergencyInfo emergencyInfo={emergencyInfo} />

            {/* Itinerary */}
            <ItineraryView
              data={data}
              checklist={checklist}
              onToggleCheck={toggleCheck}
              onAddChecklistItem={addChecklistItem}
              onRemoveChecklistItem={removeChecklistItem}
              onResetChecklist={resetChecklist}
              onUpdateNote={updateStopNote}
              onReorderStop={reorderStop}
            />
          </div>
        )}
      </main>

      {/* Chat Button */}
      {view === "itinerary" && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white/20"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Modal */}
      <ChatModal
        key={chatKey}
        city={city}
        basecamp={basecamp}
        itinerary={data}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Saved Trips Modal */}
      <SavedTripsModal
        trips={savedTrips}
        isOpen={savedTripsOpen}
        onClose={() => setSavedTripsOpen(false)}
        onLoadTrip={handleLoadTrip}
        onDeleteTrip={handleDeleteTrip}
      />

      {/* Base Camp Dock */}
      {view === "itinerary" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur border-t border-slate-200 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="p-4 pb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Hotel size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Base Camp
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                    {basecamp}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyAddress(basecamp)}
                  className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 hover:bg-slate-200 transition"
                >
                  Copy
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(basecamp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 transition"
                >
                  <MapPin size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
