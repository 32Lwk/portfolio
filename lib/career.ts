import careerData from "@/content/about/career.json";

export interface CareerMemory {
  image?: string;
  imageAlt?: string;
  text: string;
}

export interface CareerItem {
  period: string;
  title: string;
  description: string;
  type: string;
  image?: string;
  imageAlt?: string;
  memories?: CareerMemory[];
}

export function getCareer(): CareerItem[] {
  return careerData as CareerItem[];
}
