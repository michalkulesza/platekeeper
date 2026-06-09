import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "pk-timers";

export interface TimerEntry {
  id: string;
  recipeId: string;
  recipeTitle: string;
  componentIndex: number;
  stepIndex: number;
  stepText: string;
  totalSeconds: number;
  remainingAtStart: number;
  startedAt: number | null;
  status: "running" | "paused" | "done";
}

export interface ResumeInfo {
  interrupted: TimerEntry[];
  expired: TimerEntry[];
}

interface TimerContextValue {
  timers: Map<string, TimerEntry>;
  resumeInfo: ResumeInfo | null;
  hasRunningTimers: boolean;
  wakeLockTimersEnabled: boolean;
  setWakeLockTimersEnabled: (v: boolean) => void;
  startTimer: (params: Omit<TimerEntry, "remainingAtStart" | "startedAt" | "status">) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  cancelTimer: (id: string) => void;
  confirmResume: () => void;
  confirmClear: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimers() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimers must be used within TimerProvider");
  return ctx;
}

export function getRemainingSeconds(t: TimerEntry): number {
  if (t.status !== "running" || t.startedAt === null) return t.remainingAtStart;
  return Math.max(0, t.remainingAtStart - Math.floor((Date.now() - t.startedAt) / 1000));
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDurationLabel(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function parseDurationSeconds(text: string): number | null {
  // Range: use lower bound
  let m = text.match(/\b(\d+)[–\-](\d+)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i);
  if (m) {
    const n = parseInt(m[1]);
    const u = m[3].toLowerCase();
    if (u.startsWith("h")) return n * 3600;
    if (u.startsWith("m")) return n * 60;
    return n;
  }
  // "1 hour 30 minutes" / "1 hr 30 min" / "1h 30m"
  m = text.match(/\b(\d+)\s*(?:hours?|hrs?|h)\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b/i);
  if (m) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60;
  // Hours only
  m = text.match(/\b(\d+)\s*(?:hours?|hrs?)\b/i);
  if (m) return parseInt(m[1]) * 3600;
  // Minutes
  m = text.match(/\b(\d+)\s*(?:minutes?|mins?)\b/i);
  if (m) return parseInt(m[1]) * 60;
  // Seconds
  m = text.match(/\b(\d+)\s*(?:seconds?|secs?)\b/i);
  if (m) return parseInt(m[1]);
  return null;
}

function fireNotification(recipeTitle: string, stepText: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(`Timer done — ${recipeTitle}`, {
    body: stepText.length > 80 ? stepText.slice(0, 77) + "…" : stepText,
    icon: "/icon-192.png",
  });
}

function saveToStorage(timers: Map<string, TimerEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...timers.values()]));
}

function loadFromStorage(): { initialTimers: Map<string, TimerEntry>; resumeInfo: ResumeInfo | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { initialTimers: new Map(), resumeInfo: null };
    const arr: TimerEntry[] = JSON.parse(raw);
    const now = Date.now();
    const initialTimers = new Map<string, TimerEntry>();
    const interrupted: TimerEntry[] = [];
    const expired: TimerEntry[] = [];

    for (const t of arr) {
      if (t.status === "done") continue;
      if (t.status === "running" && t.startedAt) {
        const elapsed = Math.floor((now - t.startedAt) / 1000);
        const remaining = t.remainingAtStart - elapsed;
        if (remaining <= 0) {
          expired.push({ ...t, status: "done", remainingAtStart: 0, startedAt: null });
        } else {
          const paused: TimerEntry = { ...t, status: "paused", remainingAtStart: remaining, startedAt: null };
          initialTimers.set(t.id, paused);
          interrupted.push(paused);
        }
      } else if (t.status === "paused") {
        initialTimers.set(t.id, t);
        interrupted.push(t);
      }
    }

    const resumeInfo = interrupted.length > 0 || expired.length > 0 ? { interrupted, expired } : null;
    return { initialTimers, resumeInfo };
  } catch {
    return { initialTimers: new Map(), resumeInfo: null };
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Map<string, TimerEntry>>(() => loadFromStorage().initialTimers);
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(() => loadFromStorage().resumeInfo);
  const [wakeLockTimersEnabled, setWakeLockTimersEnabledState] = useState(
    () => localStorage.getItem("wakelock-timers") !== "0"
  );
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Fire notifications for timers that expired while the page was closed
  const firedExpiredRef = useRef(false);
  useEffect(() => {
    if (firedExpiredRef.current) return;
    firedExpiredRef.current = true;
    resumeInfo?.expired.forEach((t) => fireNotification(t.recipeTitle, t.stepText));
  }, []);

  // Persist on every change
  useEffect(() => {
    saveToStorage(timers);
  }, [timers]);

  // Tick: drive countdown re-renders + detect expiry
  useEffect(() => {
    const id = setInterval(() => {
      setTimers((prev) => {
        let hasRunning = false;
        let changed = false;
        const next = new Map(prev);

        for (const [tid, t] of next) {
          if (t.status !== "running") continue;
          hasRunning = true;
          if (getRemainingSeconds(t) === 0) {
            next.set(tid, { ...t, status: "done", remainingAtStart: 0, startedAt: null });
            changed = true;
            fireNotification(t.recipeTitle, t.stepText);
            setTimeout(() => {
              setTimers((m) => { const n = new Map(m); n.delete(tid); return n; });
            }, 5000);
          }
        }

        // Return new Map reference to force re-renders for live countdowns
        if (hasRunning || changed) return new Map(next);
        return prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hasRunningTimers = [...timers.values()].some((t) => t.status === "running");

  // Acquire/release wake lock based on running timers
  useEffect(() => {
    if (!wakeLockTimersEnabled || !hasRunningTimers) {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      return;
    }
    let stale = false;
    navigator.wakeLock?.request("screen").then((s) => {
      if (stale) { s.release(); return; }
      wakeLockRef.current = s;
    }).catch(() => {});
    return () => {
      stale = true;
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [wakeLockTimersEnabled, hasRunningTimers]);

  // Re-acquire after tab becomes visible
  useEffect(() => {
    function onVisible() {
      if (
        document.visibilityState === "visible" &&
        wakeLockTimersEnabled &&
        hasRunningTimers &&
        !wakeLockRef.current
      ) {
        navigator.wakeLock?.request("screen").then((s) => { wakeLockRef.current = s; }).catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [wakeLockTimersEnabled, hasRunningTimers]);

  const setWakeLockTimersEnabled = useCallback((v: boolean) => {
    localStorage.setItem("wakelock-timers", v ? "1" : "0");
    setWakeLockTimersEnabledState(v);
  }, []);

  const startTimer = useCallback(
    (params: Omit<TimerEntry, "remainingAtStart" | "startedAt" | "status">) => {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
      }
      setTimers((prev) => {
        const next = new Map(prev);
        next.set(params.id, {
          ...params,
          remainingAtStart: params.totalSeconds,
          startedAt: Date.now(),
          status: "running",
        });
        return next;
      });
    },
    []
  );

  const pauseTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const t = prev.get(id);
      if (!t || t.status !== "running") return prev;
      const next = new Map(prev);
      next.set(id, { ...t, status: "paused", remainingAtStart: getRemainingSeconds(t), startedAt: null });
      return next;
    });
  }, []);

  const resumeTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const t = prev.get(id);
      if (!t || t.status !== "paused") return prev;
      const next = new Map(prev);
      next.set(id, { ...t, status: "running", startedAt: Date.now() });
      return next;
    });
  }, []);

  const cancelTimer = useCallback((id: string) => {
    setTimers((prev) => { const n = new Map(prev); n.delete(id); return n; });
  }, []);

  const confirmResume = useCallback(() => {
    setTimers((prev) => {
      const next = new Map(prev);
      for (const [id, t] of next) {
        if (t.status === "paused") next.set(id, { ...t, status: "running", startedAt: Date.now() });
      }
      return next;
    });
    setResumeInfo(null);
  }, []);

  const confirmClear = useCallback(() => {
    setTimers(new Map());
    localStorage.removeItem(STORAGE_KEY);
    setResumeInfo(null);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timers,
        resumeInfo,
        hasRunningTimers,
        wakeLockTimersEnabled,
        setWakeLockTimersEnabled,
        startTimer,
        pauseTimer,
        resumeTimer,
        cancelTimer,
        confirmResume,
        confirmClear,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
