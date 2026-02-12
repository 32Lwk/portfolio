import projectsData from "@/content/projects/projects.json";

export interface SubProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

export interface TechnologyDetail {
  name: string;
  purpose: string;
  role: string;
}

export interface LanguageStat {
  name: string;
  percent: number;
}

export interface ProjectStats {
  commits?: number;
  developmentPeriod?: string;
  technologyCount?: number;
  linesOfCode?: number;
  contributors?: number;
  /** 言語別の割合（GitHub Languages 相当） */
  languages?: LanguageStat[];
}

export interface PerformanceMetrics {
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  loadTime?: string;
  bundleSize?: string;
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  alt: string;
  caption?: string;
}

export interface RelatedLink {
  label: string;
  url: string;
  type: "documentation" | "api" | "demo" | "video" | "other";
}

export interface Project {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  category: "Web Application" | "Algorithm" | "Infrastructure" | "Other";
  technologies: string[];
  technologyDetails?: TechnologyDetail[];
  image?: string;
  screenshots?: MediaItem[];
  videos?: MediaItem[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  date: {
    start: string;
    end?: string;
  };
  highlights: string[];
  subProjects?: SubProject[];
  stats?: ProjectStats;
  performance?: PerformanceMetrics;
  relatedLinks?: RelatedLink[];
}

export function getAllProjects(): Project[] {
  return projectsData as Project[];
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.featured);
}

export function getProjectById(id: string): Project | undefined {
  return getAllProjects().find((project) => project.id === id);
}

export function getProjectsByCategory(
  category: Project["category"]
): Project[] {
  return getAllProjects().filter((project) => project.category === category);
}
