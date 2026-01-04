"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, CloudFog, Wind, Droplets, Clock } from "lucide-react";
import { WeatherData } from "@/types";
import { getLocalTime, getTimeDifference } from "@/lib/weather";

interface Props {
  weather: WeatherData | null;
  city: string;
  timezone: string | null;
}

const WEATHER_ICONS: Record<string, React.ReactNode> = {
  sun: <Sun className="w-8 h-8 text-yellow-500" />,
  cloud: <Cloud className="w-8 h-8 text-slate-400" />,
  "cloud-sun": <Sun className="w-8 h-8 text-yellow-400" />,
  "cloud-rain": <CloudRain className="w-8 h-8 text-blue-500" />,
  "cloud-drizzle": <CloudRain className="w-8 h-8 text-blue-400" />,
  snowflake: <Snowflake className="w-8 h-8 text-cyan-400" />,
  "cloud-lightning": <CloudLightning className="w-8 h-8 text-purple-500" />,
  "cloud-fog": <CloudFog className="w-8 h-8 text-slate-400" />,
};

export default function WeatherWidget({ weather, city, timezone }: Props) {
  const [localTime, setLocalTime] = useState<string>("");
  const [timeDiff, setTimeDiff] = useState<string>("");

  useEffect(() => {
    if (!timezone) return;

    const updateTime = () => {
      setLocalTime(getLocalTime(timezone));
      setTimeDiff(getTimeDifference(timezone));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timezone]);

  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white mb-4 animate-pulse">
        <div className="h-20 bg-white/20 rounded"></div>
      </div>
    );
  }

  const icon = WEATHER_ICONS[weather.icon] || <Cloud className="w-8 h-8 text-white" />;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white mb-4 shadow-lg">
      {/* Current Weather */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {icon}
            <span className="text-4xl font-bold">{weather.temperature}°C</span>
          </div>
          <p className="text-blue-100 text-sm">{weather.condition}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>{localTime}</span>
          </div>
          {timeDiff && (
            <p className="text-blue-200 text-[10px]">{timeDiff}</p>
          )}
        </div>
      </div>

      {/* City Name */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
        <span className="text-sm font-medium">{city}</span>
        <div className="flex items-center gap-3 text-[10px] text-blue-100">
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.windSpeed} km/h
          </span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="grid grid-cols-5 gap-2">
        {weather.forecast.map((day, index) => {
          const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
          return (
            <div key={index} className="text-center">
              <p className="text-[10px] text-blue-200 mb-1">{dayName}</p>
              <p className="text-xs font-bold">{day.high}°</p>
              <p className="text-[10px] text-blue-200">{day.low}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
