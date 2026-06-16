"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Peternak } from "../types";

type TernakState = {
  /** All submissions made from this browser. */
  peternak: Peternak[];
  /** Persist a new submission (prepends to the list). */
  add: (data: Peternak) => void;
  /** Persist many submissions at once. Prepended in array order. */
  addMany: (data: Peternak[]) => void;
  /** Patch an existing record by id. */
  update: (id: string, patch: Partial<Peternak>) => void;
  /** Remove a record by id. */
  remove: (id: string) => void;
  /** Remove many records by id. Atomic. */
  removeMany: (ids: string[]) => void;
  /** Drop everything (used by Settings > Reset Demo Data). */
  reset: () => void;
};

export const useTernakStore = create<TernakState>()(
  persist(
    (set) => ({
      peternak: [],
      add: (data) =>
        set((s) => ({ peternak: [data, ...s.peternak] })),
      addMany: (data) =>
        set((s) => ({ peternak: [...data, ...s.peternak] })),
      update: (id, patch) =>
        set((s) => ({
          peternak: s.peternak.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      remove: (id) =>
        set((s) => ({ peternak: s.peternak.filter((p) => p.id !== id) })),
      removeMany: (ids) =>
        set((s) => {
          const idSet = new Set(ids);
          return { peternak: s.peternak.filter((p) => !idSet.has(p.id)) };
        }),
      reset: () => set({ peternak: [] }),
    }),
    {
      name: "siternak:peternak",
      storage: createJSONStorage(() => localStorage),
      version: 2,
    }
  )
);
