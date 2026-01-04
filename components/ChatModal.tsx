"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import { ChatMessage, ItineraryStep } from "@/types";
import { chatWithAI } from "@/lib/gemini";

interface Props {
  city: string;
  basecamp: string;
  itinerary: ItineraryStep[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ city, basecamp, itinerary, isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [history, loading]);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatWithAI(city, basecamp, geminiHistory, userMsg, itinerary);

      setGeminiHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userMsg }] },
        { role: 'model', parts: [{ text: response }] }
      ]);

      setHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'ai', text: "Error connecting to AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[600px] relative z-10">

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full"><Bot size={16} /></div>
            <div><h3 className="font-bold text-sm">AI Concierge</h3></div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={18} /></button>
        </div>

        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {history.length === 0 && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0"><Bot size={12} /></div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 max-w-[85%] shadow-sm">I&apos;m your AI travel assistant for {city}. Ask me anything about your trip!</div>
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'space-x-2'}`}>
              {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0"><Bot size={12} /></div>}
              <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                <div className="whitespace-pre-wrap prose prose-sm prose-slate max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs"><div className="animate-spin h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full" /></div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-slate-400 max-w-[85%]">Thinking...</div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex space-x-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? "Waiting for response..." : `Ask about ${city}...`}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1 bottom-1 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
