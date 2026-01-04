import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_ID });

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

    // Start chat with history
    const chat = model.startChat({
      history: history.length > 0 ? history : [
        {
          role: "user",
          parts: [{ text: context }],
        },
        {
          role: "model",
          parts: [{ text: `I understand! I'm here to help you with your trip to ${city}. I can see your itinerary and I'm ready to answer any questions about the places you'll visit, give recommendations, or help with logistics. What would you like to know?` }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

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
