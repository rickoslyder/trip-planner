import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

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
        "title": string (place name),
        "description": string (2-3 sentences about the place),
        "image_keyword": string (search term for finding a photo, e.g., "tokyo temple", "italian pasta"),
        "address": string (full street address),
        "coordinates": { "lat": number, "lng": number },
        "stops": array of strings (nearby points of interest, can be empty),
        "color": string (one of: blue, orange, purple, red, green, indigo),
        "travelTimeFromPrevious": string (estimated travel time from previous stop, e.g., "15 min drive", "10 min walk", null for first stop)
      }

      Important:
      - Use real, existing places that can be found on Google Maps
      - Addresses should be accurate and complete
      - Image keywords should be descriptive for finding relevant photos
      - Colors should vary between stops for visual distinction
      - Travel times should be realistic estimates based on typical transport methods
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up the response
    let cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    let rawData;
    try {
      rawData = JSON.parse(cleanJson);
    } catch {
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
