import heroData from "@/content/about/hero.json";

export interface HeroData {
  name: string;
  subtitle: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

export function getHero(): HeroData {
  return heroData as HeroData;
}
