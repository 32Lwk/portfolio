"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Award, Trophy } from "lucide-react";
import { getAwards } from "@/lib/awards";
import { Badge } from "@/components/ui/badge";

export function AwardsSection() {
  const awards = getAwards();
  if (awards.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">大会・賞歴</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-8">
            {awards.map((item, index) => (
              <ScrollReveal
                key={index}
                delay={index * 0.1}
                direction="left"
                className="relative flex items-start gap-6"
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                  {item.type === "大会" ? (
                    <Trophy className="h-6 w-6 text-primary" />
                  ) : (
                    <Award className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.period}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.result && (
                      <Badge variant="outline" className="text-xs">
                        {item.result}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                  {item.organizer && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      主催：{item.organizer}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      詳細リンク →
                    </a>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
