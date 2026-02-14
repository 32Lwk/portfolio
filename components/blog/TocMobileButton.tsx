"use client";

import { useToc } from "./TocContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

export function TocMobileButton() {
  const toc = useToc();
  const headings = toc?.headings ?? [];
  const activeId = toc?.activeId ?? "";
  const open = toc?.open ?? false;
  const setOpen = toc?.setOpen ?? (() => {});

  if (headings.length === 0) return null;

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-11 gap-2 rounded-full shadow-lg"
            aria-label="目次を開く"
          >
            <List className="h-5 w-5" />
            目次
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle>目次</SheetTitle>
          </SheetHeader>
          <ul className="mt-6 space-y-2 text-sm">
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
                    handleLinkClick();
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
