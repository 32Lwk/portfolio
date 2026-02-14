"use client";

import { useToc } from "./TocContext";
import { cn } from "@/lib/utils";

export function TableOfContents() {
  const toc = useToc();
  const headings = toc?.headings ?? [];
  const activeId = toc?.activeId ?? "";

  if (headings.length === 0) return null;

  return (
    <nav className="hidden shrink-0 lg:block lg:min-w-56 lg:w-56">
      <div className="sticky top-24 rounded-lg border bg-card p-4 min-h-[120px] min-w-56">
        <h3 className="mb-4 text-sm font-semibold">目次</h3>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "transition-colors",
                heading.level === 3 && "ml-4",
                heading.level === 4 && "ml-8",
                activeId === heading.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
