"use client";

import { Share2, FileDown, Calendar, Save, FolderOpen } from "lucide-react";
import { ItineraryStep, ChecklistItem } from "@/types";
import { useToast } from "@/components/Toast";
import {
  generateShareText,
  copyToClipboard,
  shareNative,
  exportToPDF,
  downloadICSFile,
} from "@/lib/share";

interface Props {
  city: string;
  basecamp: string;
  itinerary: ItineraryStep[];
  checklist: ChecklistItem[];
  tripDate?: Date;
  onSaveTrip?: () => void;
  onOpenSavedTrips?: () => void;
  hasSavedTrips?: boolean;
}

export default function TripActions({
  city,
  basecamp,
  itinerary,
  checklist,
  tripDate = new Date(),
  onSaveTrip,
  onOpenSavedTrips,
  hasSavedTrips,
}: Props) {
  const { toast } = useToast();

  const handleShare = async () => {
    const text = generateShareText(city, basecamp, itinerary, checklist);

    // Try native share first (mobile)
    const shared = await shareNative(city, text);
    if (!shared) {
      // Fallback to clipboard
      const copied = await copyToClipboard(text);
      if (copied) {
        toast.success("Itinerary copied to clipboard!");
      } else {
        toast.error("Failed to share");
      }
    }
  };

  const handleExportPDF = () => {
    exportToPDF(city, basecamp, itinerary, checklist);
    toast.success("PDF opened in new tab");
  };

  const handleAddToCalendar = () => {
    downloadICSFile(city, itinerary, tripDate);
    toast.success("Calendar file downloaded");
  };

  const handleSave = () => {
    if (onSaveTrip) {
      onSaveTrip();
      toast.success("Trip saved!");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Share */}
      <button
        onClick={handleShare}
        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
        title="Share"
      >
        <Share2 size={14} />
      </button>

      {/* Export PDF */}
      <button
        onClick={handleExportPDF}
        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
        title="Export PDF"
      >
        <FileDown size={14} />
      </button>

      {/* Add to Calendar */}
      <button
        onClick={handleAddToCalendar}
        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
        title="Add to Calendar"
      >
        <Calendar size={14} />
      </button>

      {/* Save Trip */}
      {onSaveTrip && (
        <button
          onClick={handleSave}
          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition"
          title="Save Trip"
        >
          <Save size={14} />
        </button>
      )}

      {/* Open Saved Trips */}
      {onOpenSavedTrips && hasSavedTrips && (
        <button
          onClick={onOpenSavedTrips}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
          title="My Trips"
        >
          <FolderOpen size={14} />
        </button>
      )}
    </div>
  );
}
