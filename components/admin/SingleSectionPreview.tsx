"use client";

import type { AboutFormData } from "./AboutForm";
import { AboutPreviewProvider } from "./AboutPreviewContext";
import { HeroSection } from "@/components/about/HeroSection";
import { BioSection } from "@/components/about/BioSection";
import { EducationTimeline } from "@/components/about/EducationTimeline";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { AwardsSection } from "@/components/about/AwardsSection";
import { CertificationsSection } from "@/components/about/CertificationsSection";
import { SkillsSection } from "@/components/about/SkillsSection";
import { ValuesSection } from "@/components/about/ValuesSection";
import { HometownSection } from "@/components/about/HometownSection";
import { ContactSection } from "@/components/about/ContactSection";
import { AboutBackground } from "@/components/about/AboutBackground";

/** 指定セクションのみプレビュー表示（インラインモード用） */
export function SingleSectionPreview({
  sectionId,
  data,
}: {
  sectionId: string;
  data: AboutFormData;
}) {
  return (
    <AboutPreviewProvider data={data}>
      <AboutBackground />
      <div className="@container min-h-0 min-w-0 flex-1 overflow-auto bg-background p-4">
        {sectionId === "hero" && <HeroSection />}
        {sectionId === "bio" && <BioSection />}
        {sectionId === "education" && (
          <div data-section="education">
            <EducationTimeline />
          </div>
        )}
        {sectionId === "hometown" && <HometownSection />}
        {sectionId === "career" && (
          <div data-section="career">
            <CareerTimeline />
          </div>
        )}
        {sectionId === "awards" && <AwardsSection />}
        {sectionId === "certifications" && <CertificationsSection />}
        {sectionId === "skills" && <SkillsSection />}
        {sectionId === "values" && <ValuesSection />}
        {sectionId === "contact" && <ContactSection />}
      </div>
    </AboutPreviewProvider>
  );
}
