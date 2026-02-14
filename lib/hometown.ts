import hometownData from "@/content/about/hometown.json";

export interface HometownImage {
  src: string;
  alt: string;
}

export interface HometownData {
  title: string;
  badge?: string;
  badgeLabel?: string;
  description: string;
  images: HometownImage[];
}

export function getHometown(): HometownData {
  return hometownData as HometownData;
}
