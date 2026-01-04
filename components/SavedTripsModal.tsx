"use client";

import { X, MapPin, Trash2, Calendar } from "lucide-react";
import { SavedTrip } from "@/types";

interface Props {
  trips: SavedTrip[];
  isOpen: boolean;
  onClose: () => void;
  onLoadTrip: (trip: SavedTrip) => void;
  onDeleteTrip: (tripId: string) => void;
}

export default function SavedTripsModal({
  trips,
  isOpen,
  onClose,
  onLoadTrip,
  onDeleteTrip,
}: Props) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">My Saved Trips</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Trip List */}
        <div className="flex-1 overflow-y-auto p-4">
          {trips.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No saved trips yet</p>
              <p className="text-xs mt-1">
                Generate a trip and save it for later!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition cursor-pointer group"
                  onClick={() => {
                    onLoadTrip(trip);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 mb-1">
                        {trip.city}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">
                        {trip.basecamp}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {trip.itinerary.length} stops
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(trip.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrip(trip.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
