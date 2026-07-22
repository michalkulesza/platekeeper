export interface DurationMatch {
  seconds: number;
  start: number;
  end: number;
}

// Recipe steps retain their source language, so recognize duration units across
// every app locale rather than assuming English-only instructions.
const HOUR_UNITS =
  "hours?|hrs?|h|godzin(?:a|ę|y|ach)?|godz\\.?|stunden?|std\\.?|heure?s?|horas?";
const MINUTE_UNITS =
  "minutes?|mins?|m|minut(?:a|ę|y|ach)?|min\\.?|minuten?";
const SECOND_UNITS =
  "seconds?|secs?|s|sekund(?:a|ę|y|ach)?|sek\\.?|sekunden?";
const POLISH_NUMBER_VALUES: Record<string, number> = {
  jeden: 1,
  jedna: 1,
  "jedną": 1,
  dwa: 2,
  dwie: 2,
  trzy: 3,
  cztery: 4,
  "pięć": 5,
  "sześć": 6,
  siedem: 7,
  osiem: 8,
  "dziewięć": 9,
  "dziesięć": 10,
  "jedenaście": 11,
  "dwanaście": 12,
  "trzynaście": 13,
  "czternaście": 14,
  "piętnaście": 15,
  "szesnaście": 16,
  "siedemnaście": 17,
  "osiemnaście": 18,
  "dziewiętnaście": 19,
  "dwadzieścia": 20,
};
const DURATION_VALUE = `\\d+|${Object.keys(POLISH_NUMBER_VALUES).join("|")}`;
const HOUR_UNIT = new RegExp(`^(?:${HOUR_UNITS})$`, "i");
const MINUTE_UNIT = new RegExp(`^(?:${MINUTE_UNITS})$`, "i");

const secondsForUnit = (unit: string): number => {
  if (HOUR_UNIT.test(unit)) return 3600;
  if (MINUTE_UNIT.test(unit)) return 60;
  return 1;
};

const durationValue = (value: string): number =>
  Number.isNaN(Number(value))
    ? POLISH_NUMBER_VALUES[value.toLowerCase()]
    : Number(value);

export const formatCountdown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const formatDurationLabel = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
};

export const parseDurationMatch = (text: string): DurationMatch | null => {
  return parseDurationMatches(text)[0] ?? null;
};

/** Finds every duration in an instruction, in reading order. */
export const parseDurationMatches = (text: string): DurationMatch[] => {
  const matches: DurationMatch[] = [];
  // Claim combined forms first so "1 hour and 20 minutes" becomes one timer.
  const combined = new RegExp(
    `\\b(${DURATION_VALUE})\\s*(?:${HOUR_UNITS})\\s+(?:(?:and|i|und|et|y)\\s+)?(${DURATION_VALUE})\\s*(?:${MINUTE_UNITS})\\b`,
    "gi",
  );
  let match: RegExpExecArray | null;
  while ((match = combined.exec(text))) {
    matches.push({
      seconds: durationValue(match[1]) * 3600 + durationValue(match[2]) * 60,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  const simple = new RegExp(
    `\\b(${DURATION_VALUE})(?:[–-](${DURATION_VALUE}))?\\s*(${HOUR_UNITS}|${MINUTE_UNITS}|${SECOND_UNITS})\\b`,
    "gi",
  );
  while ((match = simple.exec(text))) {
    const start = match.index;
    const end = start + match[0].length;
    if (matches.some((item) => start < item.end && end > item.start)) continue;
    const value = durationValue(match[1]);
    matches.push({
      seconds: value * secondsForUnit(match[3]),
      start,
      end,
    });
  }

  return matches.sort((a, b) => a.start - b.start);
};

export const parseDurationSeconds = (text: string): number | null => {
  return parseDurationMatch(text)?.seconds ?? null;
};
