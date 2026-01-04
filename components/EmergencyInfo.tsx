"use client";

import { useState } from "react";
import { AlertTriangle, Phone, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { EmergencyInfo as EmergencyInfoType } from "@/types";

interface Props {
  emergencyInfo: EmergencyInfoType | null;
}

export default function EmergencyInfo({ emergencyInfo }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!emergencyInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" />
          <span className="text-sm font-bold text-slate-800">
            Emergency Numbers
          </span>
          <span className="text-xs text-slate-500">
            ({emergencyInfo.country})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {/* Universal Emergency */}
          <a
            href={`tel:${emergencyInfo.emergencyNumber}`}
            className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-red-700">Emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">
                {emergencyInfo.emergencyNumber}
              </span>
              <Phone className="w-4 h-4 text-red-600" />
            </div>
          </a>

          {/* Individual Services */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${emergencyInfo.police}`}
              className="flex flex-col items-center p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition"
            >
              <span className="text-[10px] text-blue-600 mb-1">Police</span>
              <span className="text-sm font-bold text-blue-700">
                {emergencyInfo.police}
              </span>
            </a>
            <a
              href={`tel:${emergencyInfo.ambulance}`}
              className="flex flex-col items-center p-3 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition"
            >
              <span className="text-[10px] text-green-600 mb-1">Ambulance</span>
              <span className="text-sm font-bold text-green-700">
                {emergencyInfo.ambulance}
              </span>
            </a>
            <a
              href={`tel:${emergencyInfo.fire}`}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 transition"
            >
              <span className="text-[10px] text-orange-600 mb-1">Fire</span>
              <span className="text-sm font-bold text-orange-700">
                {emergencyInfo.fire}
              </span>
            </a>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Tap to call. Works on mobile devices.
          </p>
        </div>
      )}
    </div>
  );
}
