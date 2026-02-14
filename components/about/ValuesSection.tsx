"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Shield, Code, Users } from "lucide-react";
import { getValues } from "@/lib/values";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";

const iconMap = {
  Shield,
  Code,
  Users,
} as const;

export function ValuesSection() {
  const preview = useAboutPreview();
  const valuesData = preview?.values ?? getValues();
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-4 text-3xl font-bold">価値観・信念</h2>
        <div className="mb-8 rounded-lg border bg-card p-6">
          <p className="text-lg font-semibold text-primary">
            {valuesData.motto}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {valuesData.mottoDescription}
          </p>
        </div>
        <div className="space-y-6">
          {valuesData.items.map((value, index) => {
            const Icon =
              iconMap[value.icon as keyof typeof iconMap] ?? Shield;
            return (
              <ScrollReveal
                key={index}
                delay={index * 0.1}
                direction="left"
                className="flex gap-4 rounded-lg border bg-card p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
        <div className="mt-8 rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-xl font-semibold">キャリアの方向性</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">中期（5年程度）</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {valuesData.careerShortTerm}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">長期（5〜10年）</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {valuesData.careerLongTerm}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
