"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getCertifications } from "@/lib/certifications";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";
import { Badge } from "@/components/ui/badge";

export function CertificationsSection() {
  const preview = useAboutPreview();
  const certifications = preview?.certifications ?? getCertifications();
  if (certifications.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">取得資格</h2>
        <div className="flex flex-wrap gap-3">
          {certifications.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="px-4 py-2 text-sm font-medium"
            >
              {name}
            </Badge>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
