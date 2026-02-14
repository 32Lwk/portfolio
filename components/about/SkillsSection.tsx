"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getAllSkills, getSkillsByCategory } from "@/lib/skills";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";
import { Badge } from "@/components/ui/badge";

const categoryLabels: Record<string, string> = {
  言語: "Languages",
  フレームワーク: "Frameworks",
  ツール: "Tools",
  インフラ: "Infrastructure",
  データベース: "Database",
  その他: "Others",
};

export function SkillsSection() {
  const preview = useAboutPreview();
  const skills = preview?.skills ?? getAllSkills();
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <section
      className={
        preview
          ? "w-full min-w-0 max-w-full px-4 py-16 sm:px-6 lg:px-8"
          : "mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8"
      }
    >
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">スキル</h2>
        <div className="space-y-8">
          {categories.map((category) => {
            const categorySkills = preview
              ? skills.filter((s) => s.category === category)
              : getSkillsByCategory(category);
            return (
              <div key={category}>
                <h3 className="mb-4 text-xl font-semibold">
                  {category} ({categoryLabels[category] || category})
                </h3>
                <div
                  className={
                    preview
                      ? "grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3"
                      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {categorySkills.map((skill) => (
                    <ScrollReveal
                      key={skill.name}
                      delay={0.05}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <Badge
                          variant={
                            skill.level === "Advanced"
                              ? "default"
                              : skill.level === "Intermediate"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{skill.years}年</span>
                        {skill.startDate && (
                          <span className="text-xs">
                            ({skill.startDate}〜)
                          </span>
                        )}
                      </div>
                      {skill.description && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {skill.description}
                        </p>
                      )}
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
