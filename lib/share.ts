/**
 * Share and export utilities
 */

import { ItineraryStep, ChecklistItem } from "@/types";

/**
 * Generate shareable text version of itinerary
 */
export function generateShareText(
  city: string,
  basecamp: string,
  itinerary: ItineraryStep[],
  checklist?: ChecklistItem[]
): string {
  let text = `\u2708\uFE0F ${city} Trip Itinerary\n`;
  text += `\u{1F3E8} Base Camp: ${basecamp}\n`;
  text += `\u2500`.repeat(30) + "\n\n";

  itinerary.forEach((stop, index) => {
    text += `${index + 1}. ${stop.time} - ${stop.title}\n`;
    text += `   ${stop.description}\n`;
    text += `   \u{1F4CD} ${stop.address}\n`;
    if (stop.stops && stop.stops.length > 0) {
      text += `   Nearby: ${stop.stops.join(", ")}\n`;
    }
    if (stop.notes) {
      text += `   \u{1F4DD} Notes: ${stop.notes}\n`;
    }
    text += "\n";
  });

  if (checklist && checklist.length > 0) {
    text += `\u2500`.repeat(30) + "\n";
    text += "\u2705 Checklist:\n";
    checklist.forEach((item) => {
      text += `${item.done ? "\u2611\uFE0F" : "\u2610"} ${item.text}\n`;
    });
  }

  text += `\n\u2500`.repeat(30) + "\n";
  text += "Generated with AI Trip Planner";

  return text;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Share via Web Share API (mobile-friendly)
 */
export async function shareNative(
  city: string,
  text: string
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: `${city} Trip Itinerary`,
      text: text,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate HTML for PDF export
 */
export function generatePDFHTML(
  city: string,
  basecamp: string,
  itinerary: ItineraryStep[],
  checklist?: ChecklistItem[]
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${city} Trip Itinerary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; }
    .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
    .basecamp { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 32px; }
    .basecamp-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
    .basecamp-name { font-weight: 600; font-size: 16px; }
    .stop { margin-bottom: 24px; page-break-inside: avoid; }
    .stop-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .stop-number { width: 32px; height: 32px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
    .stop-time { background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .stop-title { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .stop-desc { color: #475569; font-size: 14px; margin-bottom: 8px; line-height: 1.5; }
    .stop-address { font-size: 12px; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 4px; margin-bottom: 8px; }
    .stop-nearby { font-size: 12px; color: #64748b; }
    .stop-notes { font-size: 12px; color: #7c3aed; background: #f5f3ff; padding: 8px; border-radius: 4px; margin-top: 8px; }
    .checklist { margin-top: 32px; padding-top: 24px; border-top: 2px solid #e2e8f0; }
    .checklist h2 { font-size: 16px; margin-bottom: 12px; }
    .checklist-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 14px; }
    .checkbox { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 4px; }
    .checkbox.checked { background: #3b82f6; border-color: #3b82f6; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 20px; }
      .stop { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>\u2708\uFE0F ${city} Trip</h1>
  <p class="subtitle">AI-Generated Itinerary</p>

  <div class="basecamp">
    <div class="basecamp-label">Base Camp</div>
    <div class="basecamp-name">\u{1F3E8} ${basecamp}</div>
  </div>

  ${itinerary.map((stop, index) => `
    <div class="stop">
      <div class="stop-header">
        <div class="stop-number">${index + 1}</div>
        <span class="stop-time">${stop.time}</span>
      </div>
      <h3 class="stop-title">${stop.title}</h3>
      <p class="stop-desc">${stop.description}</p>
      <div class="stop-address">\u{1F4CD} ${stop.address}</div>
      ${stop.stops && stop.stops.length > 0 ? `<div class="stop-nearby"><strong>Nearby:</strong> ${stop.stops.join(", ")}</div>` : ""}
      ${stop.notes ? `<div class="stop-notes">\u{1F4DD} ${stop.notes}</div>` : ""}
    </div>
  `).join("")}

  ${checklist && checklist.length > 0 ? `
    <div class="checklist">
      <h2>\u2705 Travel Checklist</h2>
      ${checklist.map(item => `
        <div class="checklist-item">
          <div class="checkbox ${item.done ? "checked" : ""}"></div>
          <span>${item.text}</span>
        </div>
      `).join("")}
    </div>
  ` : ""}

  <div class="footer">
    Generated with AI Trip Planner \u2022 ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Export itinerary as PDF (opens print dialog)
 */
export function exportToPDF(
  city: string,
  basecamp: string,
  itinerary: ItineraryStep[],
  checklist?: ChecklistItem[]
): void {
  const html = generatePDFHTML(city, basecamp, itinerary, checklist);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Generate Google Calendar link for a stop
 */
export function getGoogleCalendarLink(
  stop: ItineraryStep,
  tripDate: Date,
  city: string
): string {
  const baseUrl = "https://calendar.google.com/calendar/render";

  // Parse time (e.g., "9:00 AM" or "14:00")
  const timeMatch = stop.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  let hours = 9;
  let minutes = 0;

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2] || "0", 10);
    if (timeMatch[3]?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (timeMatch[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
  }

  const startDate = new Date(tripDate);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration

  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${stop.title} - ${city} Trip`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: `${stop.description}\n\nAddress: ${stop.address}`,
    location: stop.address,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate ICS file content for calendar import
 */
export function generateICSFile(
  city: string,
  itinerary: ItineraryStep[],
  tripDate: Date
): string {
  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "").slice(0, -1);
  };

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Trip Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${city} Trip
`;

  itinerary.forEach((stop) => {
    const timeMatch = stop.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    let hours = 9;
    let minutes = 0;

    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2] || "0", 10);
      if (timeMatch[3]?.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (timeMatch[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    const startDate = new Date(tripDate);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 2);

    ics += `BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${stop.title}
DESCRIPTION:${stop.description.replace(/\n/g, "\\n")}
LOCATION:${stop.address}
END:VEVENT
`;
  });

  ics += "END:VCALENDAR";
  return ics;
}

/**
 * Download ICS file
 */
export function downloadICSFile(city: string, itinerary: ItineraryStep[], tripDate: Date): void {
  const ics = generateICSFile(city, itinerary, tripDate);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${city.toLowerCase().replace(/\s+/g, "-")}-trip.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
