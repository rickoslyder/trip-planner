const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    landscape: string;
  };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

export async function searchPexelsImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.error("PEXELS_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Pexels API error:", response.status);
      return null;
    }

    const data: PexelsResponse = await response.json();

    if (data.photos && data.photos.length > 0) {
      // Return landscape format which is good for cards
      return data.photos[0].src.landscape;
    }

    return null;
  } catch (error) {
    console.error("Pexels fetch error:", error);
    return null;
  }
}

// Fetch images for multiple keywords in parallel
export async function fetchImagesForItinerary(
  steps: { image_keyword: string }[]
): Promise<(string | null)[]> {
  const promises = steps.map((step) => searchPexelsImage(step.image_keyword));
  return Promise.all(promises);
}
