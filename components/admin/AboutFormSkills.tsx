"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Skill } from "@/lib/skills";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES: Skill["category"][] = [
  "言語",
  "フレームワーク",
  "ツール",
  "インフラ",
  "データベース",
  "その他",
];

const LEVELS: Skill["level"][] = ["Advanced", "Intermediate", "Beginner"];

interface AboutFormSkillsProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function AboutFormSkills({ skills, onChange }: AboutFormSkillsProps) {
  const updateSkill = (index: number, upd: Partial<Skill>) => {
    const next = [...skills];
    next[index] = { ...next[index], ...upd };
    onChange(next);
  };

  const addSkill = () => {
    onChange([
      ...skills,
      {
        category: "言語",
        name: "",
        icon: "",
        level: "Intermediate",
        years: 1,
      },
    ]);
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>スキル一覧</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSkill}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={skills.map((_, i) => `skill-${i}`)} className="space-y-1">
        {skills.map((skill, index) => (
          <AccordionItem key={index} value={`skill-${index}`} className="rounded-lg border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-2">
                <span className="font-medium">
                  スキル {index + 1}
                  {skill.name && (
                    <span className="ml-2 text-muted-foreground">— {skill.name}</span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSkill(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label className="text-xs">カテゴリ</Label>
                <Select
                  value={skill.category}
                  onValueChange={(v) =>
                    updateSkill(index, { category: v as Skill["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">名前</Label>
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(index, { name: e.target.value })}
                  placeholder="Python"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">icon（テキスト）</Label>
                <Input
                  value={skill.icon}
                  onChange={(e) => updateSkill(index, { icon: e.target.value })}
                  placeholder="python"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">レベル</Label>
                <Select
                  value={skill.level}
                  onValueChange={(v) =>
                    updateSkill(index, { level: v as Skill["level"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">経験年数</Label>
                <Input
                  type="number"
                  min={0}
                  value={skill.years}
                  onChange={(e) =>
                    updateSkill(index, {
                      years: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">開始時期（任意）</Label>
                <Input
                  value={skill.startDate ?? ""}
                  onChange={(e) =>
                    updateSkill(index, { startDate: e.target.value || undefined })
                  }
                  placeholder="2024-04"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Label className="text-xs">説明（任意）</Label>
              <Textarea
                value={skill.description ?? ""}
                onChange={(e) =>
                  updateSkill(index, { description: e.target.value || undefined })
                }
                rows={2}
                placeholder="Flask、Pandasを使用..."
              />
            </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
