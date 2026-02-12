"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";

export interface HistoryEvent {
  date: string;
  title: string;
  description?: string;
  type?: string;
}

const DISPLAY_COUNT = 5;

export function ProjectHistorySection({ events }: { events: HistoryEvent[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [modalOpen, closeModal]);

  if (!events || events.length === 0) return null;

  const displayed = events.slice(0, DISPLAY_COUNT);
  const hasMore = events.length > DISPLAY_COUNT;

  const TimelineItem = ({ event, index, showLine }: { event: HistoryEvent; index: number; showLine: boolean }) => (
    <div className="relative flex items-start gap-4">
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background">
        <div className="h-3 w-3 rounded-full bg-primary" />
      </div>
      <div className={`flex-1 ${showLine ? "pb-6" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{event.date}</span>
          {event.type && (
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
          )}
        </div>
        <h3 className="mt-1 text-lg font-semibold">{event.title}</h3>
        {event.description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-0.5 bg-border" aria-hidden />
        <div className="space-y-6">
          {displayed.map((event, index) => (
            <TimelineItem
              key={`${event.date}-${event.title}-${index}`}
              event={event}
              index={index}
              showLine={index < displayed.length - 1}
            />
          ))}
        </div>
      </div>

      {hasMore && (
        <Button
          variant="outline"
          className="mt-6 w-full sm:w-auto"
          onClick={openModal}
          aria-expanded={modalOpen}
          aria-haspopup="dialog"
        >
          <ChevronDown className="mr-2 h-4 w-4" />
          もっと見る（{events.length}件すべて）
        </Button>
      )}

      {/* 全件表示モーダル */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
            onKeyDown={(e) => e.key === "Escape" && closeModal()}
            aria-hidden
          />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border bg-background shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
              <h2 id="history-modal-title" className="text-xl font-bold">
                開発の歴史（全{events.length}件）
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-border" aria-hidden />
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <TimelineItem
                      key={`modal-${event.date}-${event.title}-${index}`}
                      event={event}
                      index={index}
                      showLine={index < events.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t px-6 py-3">
              <Button variant="secondary" className="w-full" onClick={closeModal}>
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
