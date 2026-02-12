"use client";

import { Project } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(projects.map((project) => project.category))
  );

  const filteredProjects = projects.filter((project) => {
    if (selectedCategory && project.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="mb-2 text-sm font-semibold">カテゴリ</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            すべて
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? null : category
                )
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            該当するプロジェクトが見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
