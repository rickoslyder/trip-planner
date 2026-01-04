import { z } from "zod";

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
  coordinates: CoordinateSchema.optional(),
  stops: z.array(z.string()).default([]),
  color: z.string().default("blue"),
  imageUrl: z.string().optional(), // Added by server after Pexels fetch
  notes: z.string().optional(), // User's personal notes
  travelTimeFromPrevious: z.string().optional(), // e.g., "15 min drive"
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
