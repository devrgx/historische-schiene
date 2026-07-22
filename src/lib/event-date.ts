export function formatEventDate(
  dateValue?: string,
): string {
  if (!dateValue) {
    return "Termin noch nicht festgelegt";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Termin wird noch bekannt gegeben";
  }

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatEventTime(
  dateValue?: string,
): string | null {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}