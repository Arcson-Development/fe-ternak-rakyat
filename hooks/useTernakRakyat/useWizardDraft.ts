"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Peternak, PhotoRef } from "./types";
import {
  getPhoto,
  putPhoto,
  deletePhotos,
} from "../../utils/lib/idbPhotoStore";
import { safeRandomUUID } from "../../utils/lib/safeUuid";

/**
 * Local autosave for the wizard. The user's progress is written to
 * localStorage on every change (debounced 500ms) so a browser refresh,
 * accidental tab close, or network blip never costs them a re-typed form.
 *
 * Each wizard invocation (identified by the `modeKey` we get) has its
 * own slot, so a half-finished "edit" draft and a fresh "create" draft
 * never overwrite each other.
 *
 * Photo persistence is split across two stores:
 *   - localStorage holds the JSON-safe metadata (id, name, size).
 *   - IndexedDB (`utils/lib/idbPhotoStore`) holds the raw File bytes
 *     keyed by `id`. The `preview` blob URL is regenerated from the
 *     File on every restore so previews survive refresh.
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

/**
 * Walk the entire payload and collect every PhotoRef whose `id` is set
 * and which has a `file` attached. Used during autosave to mirror the
 * raw bytes into IndexedDB.
 */
function collectLivePhotos(payload: Peternak): PhotoRef[] {
  const out: PhotoRef[] = [];
  const push = (p: PhotoRef | undefined) => {
    if (p && p.id && p.file) out.push(p);
  };
  push(payload.ktp);
  payload.kandang.forEach((k) => {
    Object.values(k.kondisi).forEach((slot) => push(slot.foto));
    Object.values(k.peralatan).forEach((slot) => push(slot.foto));
  });
  return out;
}

/**
 * Strip non-JSON-safe bits from a PhotoRef for localStorage. `id` is
 * preserved so restore() can rehydrate the File from IndexedDB.
 */
function sanitizePhoto(photo: PhotoRef | undefined): PhotoRef {
  if (!photo) return { id: safeRandomUUID(), preview: null };
  return {
    id: photo.id,
    preview: null,
    name: photo.name,
    size: photo.size,
  };
}

function sanitizeFotoBagian<T extends Record<string, any>>(bagian: T): T {
  const out: any = { ...bagian };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v && typeof v === "object" && "foto" in v && "kondisi" in v) {
      out[key] = { ...v, foto: sanitizePhoto(v.foto) };
    }
  }
  return out as T;
}

/**
 * Walk the entire Peternak payload and strip every PhotoRef's
 * non-serializable bits. The structure is shallow enough that we can
 * do this with explicit recursion rather than a generic deep clone.
 */
function sanitizePayload(payload: Peternak): Peternak {
  return {
    ...payload,
    ktp: sanitizePhoto(payload.ktp),
    kandang: payload.kandang.map((k) => ({
      ...k,
      kondisi: sanitizeFotoBagian(k.kondisi),
      peralatan: sanitizeFotoBagian(k.peralatan),
    })),
  };
}

/**
 * Walk a sanitized payload and rehydrate every photo that has an `id`
 * but no `preview`. Looks up the File in IndexedDB, mints a fresh blob
 * URL (the old one died when the document was torn down), and rebuilds
 * a usable PhotoRef. Photos whose id is missing in IDB (private mode,
 * cleared site data, older draft before this feature) are returned
 * untouched so the UI can fall back to its "re-upload" hint.
 */
async function hydratePhotosFromIDB(payload: Peternak): Promise<Peternak> {
  const hydrateOne = async (p: PhotoRef): Promise<PhotoRef> => {
    if (p.preview !== null || !p.id) return p;
    const file = await getPhoto(p.id).catch(() => null);
    if (!file) return p;
    return { ...p, preview: URL.createObjectURL(file), file };
  };

  const ktp = await hydrateOne(payload.ktp);
  const kandang = await Promise.all(
    payload.kandang.map(async (k) => {
      const kondisiEntries = await Promise.all(
        Object.entries(k.kondisi).map(async ([key, slot]) => [
          key,
          { ...slot, foto: await hydrateOne(slot.foto) },
        ])
      );
      const peralatanEntries = await Promise.all(
        Object.entries(k.peralatan).map(async ([key, slot]) => [
          key,
          { ...slot, foto: await hydrateOne(slot.foto) },
        ])
      );
      return {
        ...k,
        kondisi: Object.fromEntries(kondisiEntries) as typeof k.kondisi,
        peralatan: Object.fromEntries(peralatanEntries) as typeof k.peralatan,
      };
    })
  );
  return { ...payload, ktp, kandang };
}

/**
 * Collect every photo id that's still referenced anywhere in the
 * payload (used to know what to keep when we wipe a draft, and to know
 * what to delete if the wizard is reset).
 */
function collectPhotoIds(payload: Peternak): string[] {
  const out: string[] = [];
  const push = (p: PhotoRef | undefined) => {
    if (p?.id) out.push(p.id);
  };
  push(payload.ktp);
  payload.kandang.forEach((k) => {
    Object.values(k.kondisi).forEach((slot) => push(slot.foto));
    Object.values(k.peralatan).forEach((slot) => push(slot.foto));
  });
  return out;
}

export function useWizardDraft(
  modeKey: string,
  mode: "create" | "edit",
  initialPayload: Peternak
) {
  const [payload, setPayload] = useState<Peternak>(initialPayload);
  const [activeStep, setActiveStep] = useState(0);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  /**
   * Set when the hook auto-restored a draft on mount. The wizard uses
   * this to show a one-time toast ("Draf dipulihkan otomatis") so the
   * user knows their previous work came back without a manual click.
   */
  const [autoRestoredAt, setAutoRestoredAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Skip the first autosave run. Without this guard, the effect fires
   * on mount with the empty initial payload and overwrites any draft
   * the user previously saved — losing the photo metadata in the
   * process. After the first real user interaction this flips to true
   * and the debounced save kicks in as expected.
   */
  const isDirty = useRef(false);

  // On mount, auto-restore any existing draft for this modeKey.
  // The previous UX showed a manual "Lanjutkan draf" banner; users
  // expected their in-progress form to come back automatically on
  // refresh, so we now hydrate silently and surface a toast.
  useEffect(() => {
    const all = readAll();
    const existing = all[modeKey];
    if (existing && existing.mode === mode && existing.savedAt) {
      (async () => {
        // Re-sanitize on restore too — defends against drafts saved by
        // older builds that didn't sanitize and may carry dead blob URLs.
        const sanitized = sanitizePayload(existing.payload);
        const hydrated = await hydratePhotosFromIDB(sanitized);
        setPayload(hydrated);
        setActiveStep(existing.activeStep);
        setSavedAt(new Date(existing.savedAt));
        setAutoRestoredAt(new Date(existing.savedAt));
        // Treat restore as the first user interaction so subsequent edits
        // resume autosave against the restored draft.
        isDirty.current = true;
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeKey]);

  // Debounced save whenever payload changes.
  // We also mirror every File currently attached to the payload into
  // IndexedDB. The putPhoto calls are best-effort: if IDB rejects them
  // (quota, private mode) the localStorage draft still saves, the
  // photo just won't survive the next reload.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty.current) {
      // First render: the payload is still the initial empty value.
      // Don't clobber a stored draft until the user actually edits
      // something.
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const all = readAll();
      const env: DraftEnvelope = {
        mode,
        modeKey,
        payload: sanitizePayload(payload),
        activeStep,
        savedAt: new Date().toISOString(),
      };
      all[modeKey] = env;
      writeAll(all);
      // Persist photo bytes alongside the metadata. Fire-and-forget —
      // we don't want to block the localStorage write on IDB latency.
      collectLivePhotos(payload).forEach((p) => {
        if (p.file) putPhoto(p.id, p.file).catch(() => {});
      });
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
    // Re-sanitize + hydrate from IDB so previews come back too.
    (async () => {
      const sanitized = sanitizePayload(existing.payload);
      const hydrated = await hydratePhotosFromIDB(sanitized);
      setPayload(hydrated);
      setActiveStep(existing.activeStep);
      setSavedAt(new Date(existing.savedAt));
      isDirty.current = true;
    })();
    return true;
  }, [modeKey, mode]);

  const clear = useCallback((): void => {
    const all = readAll();
    const existing = all[modeKey];
    delete all[modeKey];
    writeAll(all);
    // Free the IDB slots owned by this draft so we don't leak bytes
    // across wizard sessions. Best-effort — failures are silent.
    if (existing) {
      const orphanIds = collectPhotoIds(existing.payload);
      deletePhotos(orphanIds).catch(() => {});
    }
    setSavedAt(null);
  }, [modeKey]);

  /**
   * Wrapped setter: any consumer (PendaftaranWizard, step components)
   * uses this instead of the raw `useState` setter, so we can mark the
   * draft as "dirty" the first time the user actually changes
   * something. This prevents the empty initial payload from clobbering
   * an existing draft on mount.
   */
  const updatePayload = useCallback(
    (
      next:
        | Peternak
        | ((prev: Peternak) => Peternak)
    ) => {
      isDirty.current = true;
      setPayload(next as any);
    },
    []
  );

  const updateActiveStep = useCallback((step: number | ((prev: number) => number)) => {
    isDirty.current = true;
    setActiveStep(step as any);
  }, []);

  return {
    payload,
    setPayload: updatePayload,
    activeStep,
    setActiveStep: updateActiveStep,
    savedAt,
    autoRestoredAt,
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
