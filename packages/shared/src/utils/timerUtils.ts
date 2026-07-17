export interface DurationMatch {
  seconds: number;
  start: number;
  end: number;
}

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
  let m: RegExpExecArray | null;

  m = /\b(\d+)[–-](\d+)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i.exec(
    text,
  );
  if (m) {
    const n = parseInt(m[1]);
    const u = m[3].toLowerCase();
    let seconds: number;
    if (u.startsWith("h")) seconds = n * 3600;
    else if (u.startsWith("m")) seconds = n * 60;
    else seconds = n;
    return { seconds, start: m.index, end: m.index + m[0].length };
  }

  m =
    /\b(\d+)\s*(?:hours?|hrs?|h)\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b/i.exec(
      text,
    );
  if (m)
    return {
      seconds: parseInt(m[1]) * 3600 + parseInt(m[2]) * 60,
      start: m.index,
      end: m.index + m[0].length,
    };

  m = /\b(\d+)\s*(?:hours?|hrs?)\b/i.exec(text);
  if (m)
    return {
      seconds: parseInt(m[1]) * 3600,
      start: m.index,
      end: m.index + m[0].length,
    };

  m = /\b(\d+)\s*(?:minutes?|mins?)\b/i.exec(text);
  if (m)
    return {
      seconds: parseInt(m[1]) * 60,
      start: m.index,
      end: m.index + m[0].length,
    };

  m = /\b(\d+)\s*(?:seconds?|secs?)\b/i.exec(text);
  if (m)
    return {
      seconds: parseInt(m[1]),
      start: m.index,
      end: m.index + m[0].length,
    };

  return null;
};

/** Finds every duration in an instruction, in reading order. */
export const parseDurationMatches = (text: string): DurationMatch[] => {
  const matches: DurationMatch[] = [];
  // The combined form must be claimed first so "1 hour and 20 minutes" does
  // not become two independent timers.
  const combined =
    /\b(\d+)\s*(?:hours?|hrs?|h)\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = combined.exec(text))) {
    matches.push({
      seconds: parseInt(match[1]) * 3600 + parseInt(match[2]) * 60,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  const simple =
    /\b(\d+)(?:[–-](\d+))?\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?)\b/gi;
  while ((match = simple.exec(text))) {
    const start = match.index;
    const end = start + match[0].length;
    if (matches.some((item) => start < item.end && end > item.start)) continue;
    const unit = match[3].toLowerCase();
    const value = parseInt(match[1]);
    matches.push({
      seconds: unit.startsWith("h")
        ? value * 3600
        : unit.startsWith("m")
          ? value * 60
          : value,
      start,
      end,
    });
  }

  return matches.sort((a, b) => a.start - b.start);
};

export const parseDurationSeconds = (text: string): number | null => {
  let m: RegExpMatchArray | null;

  m = text.match(
    /\b(\d+)[–-](\d+)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i,
  );
  if (m) {
    const n = parseInt(m[1]);
    const u = m[3].toLowerCase();
    if (u.startsWith("h")) return n * 3600;
    if (u.startsWith("m")) return n * 60;
    return n;
  }

  m = text.match(
    /\b(\d+)\s*(?:hours?|hrs?|h)\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b/i,
  );
  if (m) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60;

  m = text.match(/\b(\d+)\s*(?:hours?|hrs?)\b/i);
  if (m) return parseInt(m[1]) * 3600;

  m = text.match(/\b(\d+)\s*(?:minutes?|mins?)\b/i);
  if (m) return parseInt(m[1]) * 60;

  m = text.match(/\b(\d+)\s*(?:seconds?|secs?)\b/i);
  if (m) return parseInt(m[1]);

  return null;
};
