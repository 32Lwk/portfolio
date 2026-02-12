import skillsData from "@/content/about/skills.json";

export interface Skill {
  category: "言語" | "フレームワーク" | "ツール" | "インフラ" | "データベース" | "その他";
  name: string;
  icon: string;
  level: "Advanced" | "Intermediate" | "Beginner";
  years: number;
  description?: string;
  startDate?: string;
}

export function getAllSkills(): Skill[] {
  return skillsData as Skill[];
}

export function getSkillsByCategory(category: Skill["category"]): Skill[] {
  return getAllSkills().filter((skill) => skill.category === category);
}

export function getSkillsByLevel(level: Skill["level"]): Skill[] {
  return getAllSkills().filter((skill) => skill.level === level);
}
