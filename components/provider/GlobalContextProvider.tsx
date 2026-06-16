"use client";

import React, { createContext, useContext, useState } from "react";

type GlobalContextValue = {
  appName: string;
};

const GlobalContext = createContext<GlobalContextValue>({ appName: "SITERNAK" });

export function GlobalContextProvider({ children }: { children: React.ReactNode }) {
  const [appName] = useState("SITERNAK");
  return <GlobalContext.Provider value={{ appName }}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  return useContext(GlobalContext);
}
