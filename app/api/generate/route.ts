import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { parseItineraryResponse } from "@/lib/validation";
import { fetchImagesForItinerary } from "@/lib/pexels";
import { GenerateRequest, GenerateResponse, ItineraryStep } from "@/types";

const MODEL_ID = "gemini-2.0-flash";

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

    // Initialize new GenAI client
    const ai = new GoogleGenAI({ apiKey });

    // Build the style description for the prompt
    const styleDescription = style === "custom" && customStyle
      ? customStyle
      : style;

    const prompt = `
      Create a 1-day itinerary for a trip to ${city}, focusing on ${styleDescription}, starting from "${basecamp}".

      Return ONLY a valid JSON array of exactly 4 stops. Each stop must have this exact structure:
      {
        "id": number (1, 2, 3, 4),
        "time": string (e.g., "9:00 AM"),
        "title": string (place name - must not be empty),
        "description": string (2-3 sentences about the place - must not be empty),
        "image_keyword": string (search term for finding a photo, e.g., "tokyo temple", "italian pasta" - must not be empty),
        "address": string (full street address - must not be empty),
        "coordinates": { "lat": number, "lng": number },
        "stops": array of strings (2-3 nearby points of interest, use empty array [] if none),
        "color": string (one of: "blue", "orange", "purple", "red", "green", "indigo"),
        "travelTimeFromPrevious": string (travel time from previous stop, e.g., "15 min drive", "10 min walk" - omit this field entirely for the first stop)
      }

      CRITICAL RULES:
      - Never use null values - use empty strings "" or empty arrays [] instead
      - All string fields must have actual content, not empty strings (except travelTimeFromPrevious which should be omitted for first stop)
      - Use real, existing places that can be found on Google Maps
      - Addresses should be accurate and complete with street, city, and country
      - Image keywords should be descriptive for finding relevant photos (include location context)
      - Colors must vary between stops for visual distinction
      - Travel times should be realistic estimates based on typical transport methods
      - Coordinates must be accurate latitude/longitude for the actual location
    `;

    // Call Gemini to generate itinerary
    // Note: Grounding tools are disabled here because they add metadata that
    // interferes with JSON parsing. The prompt itself instructs the model to
    // use accurate Google Maps data.
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        // Request JSON output - grounding disabled to ensure clean JSON response
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text ?? "";

    // Clean up the response (remove markdown code fences if present)
    let cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    let rawData;
    try {
      rawData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", cleanJson.substring(0, 500));
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "AI returned invalid JSON" },
        { status: 500 }
      );
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
