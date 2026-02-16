import educationData from "@/content/about/education.json";

/** 思い出1件に紐づく写真（複数可） */
export interface EducationMemoryImage {
  src: string;
  alt?: string;
}

export interface EducationMemory {
  /** @deprecated 単一写真は images を使用 */
  image?: string;
  /** @deprecated 単一写真は images を使用 */
  imageAlt?: string;
  /** 思い出の写真（複数） */
  images?: EducationMemoryImage[];
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
