import bioData from "@/content/about/bio.json";

export type BioBlock =
  | { type: "text"; content: string }
  | { type: "image"; src: string; alt: string };

export interface BioData {
  blocks: BioBlock[];
}

export function getBio(): BioData {
  return bioData as BioData;
}
