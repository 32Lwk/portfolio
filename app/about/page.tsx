import { Metadata } from "next";
import { HeroSection } from "@/components/about/HeroSection";
import { BioSection } from "@/components/about/BioSection";
import { EducationTimeline } from "@/components/about/EducationTimeline";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { AwardsSection } from "@/components/about/AwardsSection";
import { CertificationsSection } from "@/components/about/CertificationsSection";
import { SkillsSection } from "@/components/about/SkillsSection";
import { ValuesSection } from "@/components/about/ValuesSection";
import { ContactSection } from "@/components/about/ContactSection";

export const metadata: Metadata = {
  title: "About",
  description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <BioSection />
      <EducationTimeline />
      <CareerTimeline />
      <AwardsSection />
      <CertificationsSection />
      <SkillsSection />
      <ValuesSection />
      <ContactSection />
    </div>
  );
}
