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
import { TennisServeAnimation } from "@/components/animations/TennisServeAnimation";
import { AboutBackground } from "@/components/about/AboutBackground";

/** 本番の About ページと同一の表示（AboutPreviewProvider でデータを上書き） */
export function AboutPreview({ data }: { data: AboutFormData }) {
  return (
    <AboutPreviewProvider data={data}>
      <AboutBackground />
      <TennisServeAnimation />
      <div className="flex flex-col">
        <HeroSection />
        <BioSection />
        <div data-section="education">
          <EducationTimeline />
        </div>
        <HometownSection />
        <div data-section="career">
          <CareerTimeline />
        </div>
        <AwardsSection />
        <CertificationsSection />
        <SkillsSection />
        <ValuesSection />
        <ContactSection />
      </div>
    </AboutPreviewProvider>
  );
}
