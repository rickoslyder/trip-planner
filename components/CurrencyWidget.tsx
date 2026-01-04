"use client";

import { useState, useEffect } from "react";
import { DollarSign, RefreshCw } from "lucide-react";
import { CurrencyInfo } from "@/types";
import { formatCurrency, convertCurrency, CURRENCIES } from "@/lib/currency";

interface Props {
  currencyInfo: CurrencyInfo | null;
  userCurrency?: string;
}

const QUICK_AMOUNTS = [10, 50, 100, 500];

export default function CurrencyWidget({ currencyInfo, userCurrency = "USD" }: Props) {
  const [conversions, setConversions] = useState<number[]>([]);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customResult, setCustomResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currencyInfo) return;

    // Calculate quick conversions
    const results = QUICK_AMOUNTS.map(amount => amount * currencyInfo.rate);
    setConversions(results);
  }, [currencyInfo]);

  const handleCustomConvert = async () => {
    if (!customAmount || !currencyInfo) return;

    setLoading(true);
    try {
      const amount = parseFloat(customAmount);
      if (isNaN(amount)) return;

      const result = await convertCurrency(amount, userCurrency, currencyInfo.code);
      setCustomResult(formatCurrency(result, currencyInfo.code));
    } catch (error) {
      console.error("Conversion error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currencyInfo) {
    return null;
  }

  const userCurrencySymbol = CURRENCIES[userCurrency]?.symbol || "$";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Currency
        </h3>
        <span className="text-xs text-slate-500">
          {currencyInfo.code} ({currencyInfo.symbol})
        </span>
      </div>

      {/* Exchange Rate */}
      <div className="bg-slate-50 rounded-xl p-3 mb-3">
        <p className="text-center text-sm text-slate-600">
          <span className="font-bold">{userCurrencySymbol}1 {userCurrency}</span>
          {" = "}
          <span className="font-bold text-green-600">
            {formatCurrency(currencyInfo.rate, currencyInfo.code)}
          </span>
        </p>
      </div>

      {/* Quick Conversions */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {QUICK_AMOUNTS.map((amount, index) => (
          <div key={amount} className="text-center">
            <p className="text-[10px] text-slate-400 mb-0.5">
              {userCurrencySymbol}{amount}
            </p>
            <p className="text-xs font-bold text-slate-700">
              {currencyInfo.symbol}{Math.round(conversions[index] || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Custom Conversion */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {userCurrencySymbol}
          </span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomConvert()}
            placeholder="Amount"
            className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
          />
        </div>
        <button
          onClick={handleCustomConvert}
          disabled={loading || !customAmount}
          className="px-3 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {customResult && (
        <p className="text-center mt-2 text-sm font-bold text-green-600">
          = {customResult}
        </p>
      )}
    </div>
  );
}
