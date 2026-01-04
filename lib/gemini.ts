import {
  ItineraryStep,
  TripStyle,
  GenerateResponse,
  ChatResponse,
} from "@/types";

/**
 * Client-side API wrappers that call server routes.
 * API keys are kept server-side for security.
 */

export async function generateItinerary(
  city: string,
  basecamp: string,
  style: TripStyle,
  customStyle?: string
): Promise<ItineraryStep[]> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ city, basecamp, style, customStyle }),
  });

  const data: GenerateResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to generate itinerary");
  }

  return data.data;
}

export async function chatWithAI(
  city: string,
  basecamp: string,
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  itinerary?: ItineraryStep[]
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      city,
      basecamp,
      message: userMessage,
      history,
      itinerary,
    }),
  });

  const data: ChatResponse = await response.json();

  if (!data.success || !data.message) {
    throw new Error(data.error || "Failed to get response");
  }

  return data.message;
}
