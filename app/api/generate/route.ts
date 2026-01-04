import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { parseItineraryResponse } from "@/lib/validation";
import { fetchImagesForItinerary } from "@/lib/pexels";
import { GenerateRequest, GenerateResponse, ItineraryStep } from "@/types";

// Stage 1: Gemini 2.5 Flash with Google Maps grounding for accurate place data
const GROUNDING_MODEL = "gemini-2.5-flash";
// Stage 2: Gemini 2.5 Flash Lite for cheap/fast JSON conversion
const JSON_MODEL = "gemini-2.5-flash-lite";

/**
 * Extract a balanced JSON array from a string that may contain extra content.
 * Uses bracket counting to find the complete array even when followed by metadata.
 */
function extractJsonArray(text: string): string | null {
  const startIndex = text.indexOf("[");
  if (startIndex === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
      if (depth === 0) {
        return text.substring(startIndex, i + 1);
      }
    }
  }

  return null; // Unbalanced brackets
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { city, basecamp, style, customStyle } = body;

    if (!city || !basecamp || !style) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate custom style has content when style is "custom"
    if (style === "custom" && !customStyle?.trim()) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "Custom style description is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    // Initialize GenAI client
    const ai = new GoogleGenAI({ apiKey });

    // Build the style description for the prompt
    const styleDescription = style === "custom" && customStyle
      ? customStyle
      : style;

    // ============================================================
    // STAGE 1: Get grounded place recommendations with Google Maps
    // ============================================================
    const groundingPrompt = `
      Create a 1-day itinerary for a trip to ${city}, focusing on ${styleDescription}, starting from "${basecamp}".

      Recommend exactly 4 real places to visit. For each place, provide:
      - The exact name of the place
      - A 2-3 sentence description
      - The full street address
      - Approximate coordinates (latitude, longitude)
      - 2-3 nearby points of interest
      - Estimated travel time from the previous stop

      Use accurate, real information from Google Maps. Only recommend places that actually exist.
    `;

    const groundedResponse = await ai.models.generateContent({
      model: GROUNDING_MODEL,
      contents: groundingPrompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const groundedText = groundedResponse.text ?? "";

    // Log grounding metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidate = (groundedResponse as any).candidates?.[0];
    if (candidate?.groundingMetadata) {
      const gm = candidate.groundingMetadata;
      console.log("Grounding metadata:", JSON.stringify({
        chunks: gm.groundingChunks?.length ?? 0,
        supports: gm.groundingSupports?.length ?? 0,
        hasWidget: !!gm.googleMapsWidgetContextToken,
      }));
    }

    // ============================================================
    // STAGE 2: Convert to structured JSON with Flash Lite
    // ============================================================
    const jsonPrompt = `
      Convert the following trip itinerary into a JSON array.

      Input itinerary:
      ${groundedText}

      Output format - Return ONLY a valid JSON array with exactly 4 objects:
      [
        {
          "id": 1,
          "time": "9:00 AM",
          "title": "Place Name",
          "description": "2-3 sentence description",
          "image_keyword": "search term for photo (e.g., 'tokyo temple', 'paris cafe')",
          "address": "Full street address",
          "coordinates": { "lat": number, "lng": number },
          "stops": ["nearby point 1", "nearby point 2"],
          "color": "blue",
          "travelTimeFromPrevious": "15 min walk"
        }
      ]

      Rules:
      - id: sequential 1-4
      - time: spread throughout day starting 9:00 AM
      - color: use different colors (blue, orange, purple, red, green, indigo)
      - travelTimeFromPrevious: omit for first stop, include for others
      - image_keyword: descriptive search term including location context
      - Never use null values
    `;

    const jsonResponse = await ai.models.generateContent({
      model: JSON_MODEL,
      contents: jsonPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = jsonResponse.text ?? "";

    // Clean up the response
    let cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Robust JSON array extraction
    let rawData;
    try {
      rawData = JSON.parse(cleanJson);
    } catch {
      const extracted = extractJsonArray(cleanJson);
      if (extracted) {
        try {
          rawData = JSON.parse(extracted);
        } catch (parseError) {
          console.error("JSON parse error after extraction:", parseError);
          console.error("Extracted JSON:", extracted.substring(0, 500));
          return NextResponse.json<GenerateResponse>(
            { success: false, error: "Failed to parse itinerary" },
            { status: 500 }
          );
        }
      } else {
        console.error("Could not extract JSON array from response");
        console.error("Raw response:", cleanJson.substring(0, 500));
        return NextResponse.json<GenerateResponse>(
          { success: false, error: "Failed to parse itinerary" },
          { status: 500 }
        );
      }
    }

    // Validate with Zod
    let validatedData: ItineraryStep[];
    try {
      validatedData = parseItineraryResponse(rawData);
    } catch (error) {
      console.error("Validation error:", error);
      console.error("Raw data:", JSON.stringify(rawData, null, 2).substring(0, 1000));
      return NextResponse.json<GenerateResponse>(
        { success: false, error: error instanceof Error ? error.message : "Validation failed" },
        { status: 500 }
      );
    }

    // Fetch images from Pexels
    const imageUrls = await fetchImagesForItinerary(validatedData);

    // Add image URLs to the data
    const dataWithImages = validatedData.map((step, index) => ({
      ...step,
      imageUrl: imageUrls[index] || undefined,
    }));

    return NextResponse.json<GenerateResponse>({
      success: true,
      data: dataWithImages,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json<GenerateResponse>(
      { success: false, error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
