import { Metadata } from "next";
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
import { TennisServeAnimationDynamic } from "@/components/animations/TennisServeAnimationDynamic";
import { getSiteUrl } from "@/lib/site-url";
import { getDefaultOgImage } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "About",
  description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
  openGraph: {
    url: `${siteUrl}/about`,
    title: "About | 川嶋 宥翔",
    description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
    type: "website",
    images: [getDefaultOgImage("川嶋 宥翔 | About")],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | 川嶋 宥翔",
    description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
    images: ["/og_image.png"],
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutBackground />
      <TennisServeAnimationDynamic />
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
    </>
  );
}
