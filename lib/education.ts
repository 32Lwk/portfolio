import educationData from "@/content/about/education.json";

export interface EducationMemory {
  image?: string;
  imageAlt?: string;
  text: string;
}

export interface EducationItem {
  period: string;
  institution: string;
  description: string;
  type: string;
  image?: string;
  imageAlt?: string;
  memories?: EducationMemory[];
}

export function getEducation(): EducationItem[] {
  return educationData as EducationItem[];
}
