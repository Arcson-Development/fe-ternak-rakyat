"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Peternak } from "./types";

/**
 * Local autosave for the wizard. The user's progress is written to
 * localStorage on every change (debounced 500ms) so a browser refresh,
 * accidental tab close, or network blip never costs them a re-typed form.
 *
 * Each wizard invocation (identified by the `modeKey` we get) has its
 * own slot, so a half-finished "edit" draft and a fresh "create" draft
 * never overwrite each other.
 */

const STORAGE_KEY = "siternak-wizard-draft";
const SAVE_DELAY = 500;

type DraftEnvelope = {
  mode: "create" | "edit";
  modeKey: string;
  payload: Peternak;
  activeStep: number;
  savedAt: string;
};

function readAll(): Record<string, DraftEnvelope> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) ?? {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, DraftEnvelope>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota exceeded or storage disabled - silently drop
  }
}

export function useWizardDraft(
  modeKey: string,
  mode: "create" | "edit",
  initialPayload: Peternak
) {
  const [payload, setPayload] = useState<Peternak>(initialPayload);
  const [activeStep, setActiveStep] = useState(0);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount, check for an existing draft for this modeKey
  useEffect(() => {
    const all = readAll();
    const existing = all[modeKey];
    if (existing && existing.mode === mode && existing.savedAt) {
      setDraftAvailable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeKey]);

  // Debounced save whenever payload changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const all = readAll();
      const env: DraftEnvelope = {
        mode,
        modeKey,
        payload,
        activeStep,
        savedAt: new Date().toISOString(),
      };
      all[modeKey] = env;
      writeAll(all);
      setSavedAt(new Date(env.savedAt));
    }, SAVE_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [payload, activeStep, modeKey, mode]);

  const restore = useCallback((): boolean => {
    const all = readAll();
    const existing = all[modeKey];
    if (!existing || existing.mode !== mode) return false;
    setPayload(existing.payload);
    setActiveStep(existing.activeStep);
    setDraftAvailable(false);
    return true;
  }, [modeKey, mode]);

  const clear = useCallback((): void => {
    const all = readAll();
    delete all[modeKey];
    writeAll(all);
    setDraftAvailable(false);
    setSavedAt(null);
  }, [modeKey]);

  return {
    payload,
    setPayload,
    activeStep,
    setActiveStep,
    savedAt,
    draftAvailable,
    restore,
    clear,
  };
}

/**
 * List all drafts across all keys. Used by the dashboard to show
 * "Ada 2 draf yang belum selesai" badges.
 */
export function listAllDrafts(): { modeKey: string; envelope: DraftEnvelope }[] {
  const all = readAll();
  return Object.entries(all).map(([k, v]) => ({ modeKey: k, envelope: v }));
}

export function deleteDraft(modeKey: string): void {
  const all = readAll();
  delete all[modeKey];
  writeAll(all);
}
