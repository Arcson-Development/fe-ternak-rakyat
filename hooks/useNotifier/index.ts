"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook that wraps Mantine notifications.show() with:
 *   - Optional audible feedback (uses Web Audio API to generate a tone)
 *   - Optional browser Notification API integration
 *   - Local toggle persisted to localStorage
 *
 * Designed to work without any external audio assets (synthesizes the
 * tone from an OscillatorNode).
 */

export type SoundType = "ping" | "chime" | "alert" | "success" | "none";

const STORAGE_KEY = "siternak-notify-prefs";

type Prefs = {
  sound: SoundType;
  browser: boolean;
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return { sound: "ping", browser: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { sound: "ping", browser: false };
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

/** Synthesize a short tone using Web Audio API. */
function playTone(type: Exclude<SoundType, "none">) {
  if (typeof window === "undefined") return;
  const Ctx =
    (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;

  // Different patterns for each sound type
  const config: Record<Exclude<SoundType, "none">, { freq: number; dur: number; vol: number; sweep?: number }> = {
    ping: { freq: 880, dur: 0.12, vol: 0.18 },
    chime: { freq: 1320, dur: 0.18, vol: 0.18, sweep: 200 },
    success: { freq: 660, dur: 0.14, vol: 0.18 },
    alert: { freq: 440, dur: 0.22, vol: 0.22, sweep: -120 },
  };

  const cfg = config[type];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(cfg.freq, now);
  if (cfg.sweep) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(80, cfg.freq + cfg.sweep),
      now + cfg.dur
    );
  }
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(cfg.vol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + cfg.dur + 0.05);

  // For success: two-tone major-third arpeggio
  if (type === "success") {
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(cfg.freq * 1.25, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(cfg.vol, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.32);
  }

  setTimeout(() => ctx.close(), 500);
}

/** Request browser Notification permission. Returns the resulting permission. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/** Fire a browser notification if permission is granted. */
export function fireBrowserNotification(title: string, body?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {}
}

export function useNotifier() {
  const [prefs, setPrefs] = useState<Prefs>({ sound: "ping", browser: false });
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setPrefs(loadPrefs());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const setSound = (sound: SoundType) => {
    const next = { ...prefs, sound };
    setPrefs(next);
    savePrefs(next);
  };

  const setBrowserEnabled = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") {
        // User denied; keep toggle off
        const next = { ...prefs, browser: false };
        setPrefs(next);
        savePrefs(next);
        return false;
      }
    }
    const next = { ...prefs, browser: enabled };
    setPrefs(next);
    savePrefs(next);
    return enabled;
  };

  /** Play the configured sound (if any). */
  const beep = (type?: SoundType) => {
    const effective = type ?? prefs.sound;
    if (effective === "none") return;
    playTone(effective);
  };

  /** Combined: play sound + fire browser notification if enabled. */
  const notify = (title: string, body?: string, sound?: SoundType) => {
    beep(sound);
    if (prefs.browser) fireBrowserNotification(title, body);
  };

  return {
    prefs,
    permission,
    setSound,
    setBrowserEnabled,
    beep,
    notify,
    requestPermission: requestNotificationPermission,
  };
}
