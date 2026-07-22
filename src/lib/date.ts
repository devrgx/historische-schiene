export function formatGermanDate(
  date: Date | null,
): string {
  if (!date) {
    return "Noch nicht veröffentlicht";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}