import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AboutForm } from "@/components/admin/AboutForm";
import type { AboutFormData } from "@/components/admin/AboutForm";
import { getHero } from "@/lib/hero";
import { getBio } from "@/lib/bio";
import { getEducation } from "@/lib/education";
import { getCareer } from "@/lib/career";
import { getHometown } from "@/lib/hometown";
import { getAwards } from "@/lib/awards";
import { getCertifications } from "@/lib/certifications";
import { getAllSkills } from "@/lib/skills";
import { getValues } from "@/lib/values";
import { getContact } from "@/lib/contact";

export default function AdminAboutPage() {
  const initial: AboutFormData = {
    hero: getHero(),
    bio: getBio(),
    education: getEducation(),
    career: getCareer(),
    hometown: getHometown(),
    awards: getAwards(),
    certifications: getCertifications(),
    skills: getAllSkills(),
    values: getValues(),
    contact: getContact(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">About 編集</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/about" target="_blank" rel="noopener noreferrer">
            サイトで見る
          </Link>
        </Button>
      </div>
      <AboutForm initial={initial} />
    </div>
  );
}
