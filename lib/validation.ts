import { z } from "zod";

// Helper to convert null to undefined for optional fields
const nullToUndefined = <T>(schema: z.ZodType<T>) =>
  z.union([schema, z.null()]).transform((val) => (val === null ? undefined : val));

export const CoordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const ItineraryStepSchema = z.object({
  id: z.number(),
  time: z.string(),
  title: z.string(),
  description: z.string(),
  image_keyword: z.string(),
  address: z.string(),
  // Gemini may return null for optional fields - handle gracefully
  coordinates: nullToUndefined(CoordinateSchema).optional(),
  stops: z.array(z.string()).nullable().default([]).transform((val) => val ?? []),
  color: z.string().nullable().default("blue").transform((val) => val ?? "blue"),
  imageUrl: z.string().optional(), // Added by server after Pexels fetch
  notes: z.string().optional(), // User's personal notes
  // Field may be absent, null, or a string - handle all cases
  travelTimeFromPrevious: z.string().nullable().optional().transform((val) => val ?? undefined),
});

export const ItineraryResponseSchema = z.array(ItineraryStepSchema);

export type ValidatedItineraryStep = z.infer<typeof ItineraryStepSchema>;

// Parse and validate with helpful error messages
export function parseItineraryResponse(data: unknown): ValidatedItineraryStep[] {
  try {
    // Handle if data is wrapped in an object
    const arrayData = Array.isArray(data) ? data : (data as { itinerary?: unknown }).itinerary || data;

    const result = ItineraryResponseSchema.parse(arrayData);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      throw new Error(`Invalid itinerary format: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}
