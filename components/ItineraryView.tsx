"use client";

import { useState } from "react";
import { ItineraryStep, ChecklistItem } from "@/types";
import { MapPin, Check, Rocket, Briefcase, Copy, Car, Navigation, Map, ChevronUp, ChevronDown, X, Plus, StickyNote } from "lucide-react";
import { useToast } from "@/components/Toast";
import { getUberLink, getSmartMapsLink, getWazeLink } from "@/lib/deeplinks";

interface Props {
  data: ItineraryStep[];
  checklist: ChecklistItem[];
  onToggleCheck: (id: number) => void;
  onAddChecklistItem?: (text: string) => void;
  onRemoveChecklistItem?: (id: number) => void;
  onResetChecklist?: () => void;
  onUpdateNote?: (stopId: number, note: string) => void;
  onReorderStop?: (stopId: number, direction: "up" | "down") => void;
}

export default function ItineraryView({
  data,
  checklist,
  onToggleCheck,
  onAddChecklistItem,
  onRemoveChecklistItem,
  onResetChecklist,
  onUpdateNote,
  onReorderStop,
}: Props) {
  const { toast } = useToast();
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied!");
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim() && onAddChecklistItem) {
      onAddChecklistItem(newChecklistItem.trim());
      setNewChecklistItem("");
    }
  };

  const startEditingNote = (stop: ItineraryStep) => {
    setEditingNoteId(stop.id);
    setNoteText(stop.notes || "");
  };

  const saveNote = (stopId: number) => {
    if (onUpdateNote) {
      onUpdateNote(stopId, noteText);
    }
    setEditingNoteId(null);
    setNoteText("");
  };

  // Handle both named colors (Tailwind classes) and hex colors
  const getColorStyle = (color: string): { className?: string; style?: React.CSSProperties } => {
    if (color.startsWith("#")) {
      return { style: { backgroundColor: color } };
    }
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-600',
      'orange': 'bg-orange-500',
      'purple': 'bg-purple-600',
      'red': 'bg-red-600',
      'green': 'bg-green-600',
      'yellow': 'bg-yellow-500',
      'pink': 'bg-pink-500',
      'indigo': 'bg-indigo-600',
      'teal': 'bg-teal-600',
      'cyan': 'bg-cyan-600',
      'emerald': 'bg-emerald-600',
      'amber': 'bg-amber-500',
    };
    return { className: colorMap[color] || 'bg-blue-600' };
  };

  return (
    <div className="pb-40">
      {/* Checklist */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-700" /> Essentials
          </h3>
          {onResetChecklist && (
            <button
              onClick={onResetChecklist}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-2">
          {checklist.map(item => (
            <div key={item.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors group">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors cursor-pointer ${item.done ? 'bg-blue-700 border-blue-700' : 'border-slate-300'}`}
                onClick={() => onToggleCheck(item.id)}
              >
                {item.done && <Check className="text-white w-3 h-3" />}
              </div>
              <span
                className={`text-sm flex-1 transition-all cursor-pointer ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                onClick={() => onToggleCheck(item.id)}
              >
                {item.text}
              </span>
              {onRemoveChecklistItem && (
                <button
                  onClick={() => onRemoveChecklistItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add new item */}
        {onAddChecklistItem && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItem()}
                placeholder="Add item..."
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="px-3 py-2 bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-8">
        {data.map((stop, index) => {
          const colorStyle = getColorStyle(stop.color);
          const deepLinkParams = {
            address: stop.address,
            lat: stop.coordinates?.lat,
            lng: stop.coordinates?.lng,
            name: stop.title,
          };

          return (
            <div key={stop.id} className="relative z-10 pb-2 timeline-connector">
              {/* Travel time from previous stop */}
              {index > 0 && stop.travelTimeFromPrevious && (
                <div className="absolute left-[-13px] top-[-20px] flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <Car className="w-3 h-3" />
                  {stop.travelTimeFromPrevious}
                </div>
              )}

              {/* Timeline Node */}
              <div
                className={`absolute left-[-25px] top-0 w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white ring-1 ring-slate-100 ${colorStyle.className || ''}`}
                style={colorStyle.style}
              >
                {index + 1}
              </div>

              {/* Card */}
              <div className="group transition-transform active:scale-[0.99] duration-200">
                {/* Image */}
                <div className="h-32 w-full bg-slate-200 relative rounded-t-2xl overflow-hidden">
                  <img
                    src={stop.imageUrl || `https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop`}
                    alt={stop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                  {/* Time badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white border border-white/10">{stop.time}</span>
                  </div>

                  {/* Reorder buttons */}
                  {onReorderStop && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => onReorderStop(stop.id, "up")}
                          className="w-6 h-6 bg-black/40 backdrop-blur-md rounded flex items-center justify-center text-white hover:bg-black/60 transition"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < data.length - 1 && (
                        <button
                          onClick={() => onReorderStop(stop.id, "down")}
                          className="w-6 h-6 bg-black/40 backdrop-blur-md rounded flex items-center justify-center text-white hover:bg-black/60 transition"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 text-white w-full pr-8">
                    <h2 className="text-lg font-bold leading-tight">{stop.title}</h2>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-white rounded-b-2xl p-5 shadow-sm border-x border-b border-slate-100 relative z-10 -mt-1">
                  <p className="text-slate-600 text-sm mb-4">{stop.description}</p>

                  {stop.stops && stop.stops.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {stop.stops.map((s, i) => (
                        <div key={i} className="flex items-center p-2 bg-slate-50 rounded-lg border border-slate-50">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-xs shrink-0">
                            <MapPin className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes section */}
                  {onUpdateNote && (
                    <div className="mb-4">
                      {editingNoteId === stop.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your notes..."
                            className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveNote(stop.id)}
                              className="px-3 py-1.5 text-xs bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : stop.notes ? (
                        <div
                          onClick={() => startEditingNote(stop)}
                          className="p-3 bg-purple-50 border border-purple-100 rounded-lg cursor-pointer hover:bg-purple-100 transition"
                        >
                          <div className="flex items-start gap-2">
                            <StickyNote className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-purple-700 whitespace-pre-wrap">{stop.notes}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingNote(stop)}
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition"
                        >
                          <StickyNote className="w-4 h-4" />
                          Add note...
                        </button>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-400 mb-3 font-mono truncate flex items-center gap-1">
                    <Rocket className="w-3 h-3 text-blue-500" /> {stop.address}
                  </div>

                  {/* Action Buttons - 4 column grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => copyAddress(stop.address)}
                      className="flex flex-col items-center justify-center py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition active:scale-95"
                    >
                      <Copy className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-semibold">Copy</span>
                    </button>
                    <a
                      href={getUberLink(deepLinkParams)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-2.5 bg-black hover:bg-gray-800 rounded-xl text-white transition active:scale-95"
                    >
                      <Car className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-semibold">Uber</span>
                    </a>
                    <a
                      href={getSmartMapsLink(deepLinkParams)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition active:scale-95"
                    >
                      <Map className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-semibold">Maps</span>
                    </a>
                    <a
                      href={getWazeLink(deepLinkParams)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white transition active:scale-95"
                    >
                      <Navigation className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-semibold">Waze</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
