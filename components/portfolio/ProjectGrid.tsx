"use client";

import { Project } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen } from "lucide-react";

type SortOption = "dateDesc" | "dateAsc" | "nameAsc" | "nameDesc";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("dateDesc");

  const categories = Array.from(
    new Set(projects.map((project) => project.category))
  );

  const filteredAndSortedProjects = useMemo(() => {
    let list = projects.filter((project) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = project.name.toLowerCase().includes(q);
        const matchDesc = project.description.toLowerCase().includes(q);
        const matchTech = project.technologies.some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!matchName && !matchDesc && !matchTech) return false;
      }
      if (selectedCategory && project.category !== selectedCategory)
        return false;
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case "dateDesc":
        sorted.sort((a, b) =>
          (b.date.start || "").localeCompare(a.date.start || "")
        );
        break;
      case "dateAsc":
        sorted.sort((a, b) =>
          (a.date.start || "").localeCompare(b.date.start || "")
        );
        break;
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [projects, searchQuery, selectedCategory, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== null ||
    sortBy !== "dateDesc";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSortBy("dateDesc");
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold">検索</h3>
          <Input
            type="search"
            placeholder="名前・説明・技術で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">カテゴリ</h3>
          <div className="flex flex-wrap items-center gap-2">
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
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                リセット
              </Button>
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">ソート</h3>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateDesc">開始日 新しい順</SelectItem>
              <SelectItem value="dateAsc">開始日 古い順</SelectItem>
              <SelectItem value="nameAsc">名前 昇順</SelectItem>
              <SelectItem value="nameDesc">名前 降順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {projects.length === 0
              ? "プロジェクトがまだありません。"
              : "該当するプロジェクトが見つかりませんでした。"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
