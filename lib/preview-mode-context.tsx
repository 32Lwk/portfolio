"use client";

import { createContext, useContext, type ReactNode } from "react";

const PreviewModeContext = createContext(false);

export function usePreviewMode(): boolean {
  return useContext(PreviewModeContext);
}

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  return (
    <PreviewModeContext.Provider value={true}>
      {children}
    </PreviewModeContext.Provider>
  );
}
