"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AboutFormData } from "./AboutForm";
import { PreviewModeProvider } from "@/lib/preview-mode-context";

const AboutPreviewContext = createContext<AboutFormData | null>(null);

export function useAboutPreview(): AboutFormData | null {
  return useContext(AboutPreviewContext);
}

export function AboutPreviewProvider({
  data,
  children,
}: {
  data: AboutFormData;
  children: ReactNode;
}) {
  return (
    <AboutPreviewContext.Provider value={data}>
      <PreviewModeProvider>{children}</PreviewModeProvider>
    </AboutPreviewContext.Provider>
  );
}
