import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Content } from "@google/genai";
import { ChatRequest, ChatResponse } from "@/types";

const MODEL_ID = "gemini-2.0-flash";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { city, basecamp, message, history, itinerary } = body;

    if (!city || !message) {
      return NextResponse.json<ChatResponse>(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json<ChatResponse>(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build context that includes itinerary information
    let context = `You are a helpful travel assistant. The user is planning a trip to ${city} and staying at "${basecamp}".`;

    if (itinerary && itinerary.length > 0) {
      context += `\n\nTheir current itinerary has ${itinerary.length} stops:\n`;
      itinerary.forEach((stop, index) => {
        context += `\nStop ${index + 1}: ${stop.title} at ${stop.time}`;
        context += `\n  - ${stop.description}`;
        context += `\n  - Address: ${stop.address}`;
        if (stop.stops && stop.stops.length > 0) {
          context += `\n  - Nearby: ${stop.stops.join(", ")}`;
        }
      });
      context += "\n\nYou can reference these stops when answering questions.";
    }

    // Build chat history in the new format
    const chatHistory: Content[] = history.length > 0
      ? history.map(h => ({
          role: h.role as "user" | "model",
          parts: h.parts,
        }))
      : [
          {
            role: "user" as const,
            parts: [{ text: context }],
          },
          {
            role: "model" as const,
            parts: [{ text: `I understand! I'm here to help you with your trip to ${city}. I can see your itinerary and I'm ready to answer any questions about the places you'll visit, give recommendations, or help with logistics. What would you like to know?` }],
          },
        ];

    // Create chat session
    const chat = ai.chats.create({
      model: MODEL_ID,
      history: chatHistory,
      config: {
        // Enable grounding with Google Search for real-time info about places
        tools: [{ googleSearch: {} }],
      },
    });

    // Send the message
    const response = await chat.sendMessage({
      message,
    });

    const responseText = response.text ?? "";

    return NextResponse.json<ChatResponse>({
      success: true,
      message: responseText,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json<ChatResponse>(
      { success: false, error: "Failed to get response" },
      { status: 500 }
    );
  }
}
