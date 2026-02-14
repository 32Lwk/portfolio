"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TocContextValue {
  headings: Heading[];
  activeId: string;
  setActiveId: (id: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TocContext = createContext<TocContextValue | null>(null);

export function useToc() {
  const ctx = useContext(TocContext);
  return ctx;
}

export function TocProvider({ children }: { children: React.ReactNode }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2, h3, h4");
    const headingList: Heading[] = [];

    headingElements.forEach((heading) => {
      const id =
        heading.id ||
        heading.textContent?.toLowerCase().replace(/\s+/g, "-") ||
        "";
      if (!heading.id) {
        heading.id = id;
      }
      headingList.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.charAt(1)),
      });
    });

    setHeadings(headingList);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66% 0px" }
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => {
      headingElements.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  const value: TocContextValue = {
    headings,
    activeId,
    setActiveId,
    open,
    setOpen,
  };

  return (
    <TocContext.Provider value={value}>{children}</TocContext.Provider>
  );
}
