// Helper function untuk ubah "HH:mm" → "h:mm AM/PM"
export function formatTimeToAmPm(time: string): string {
  if (!time) return ""; // antisipasi jika kosong

  const [hourStr, minuteStr = "00"] = time.split(":");
  const hour = parseInt(hourStr, 10);

  if (isNaN(hour)) return time; // jika format tidak valid

  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${minuteStr} ${ampm}`;
}
