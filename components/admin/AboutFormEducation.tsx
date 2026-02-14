"use client";

import { useRef } from "react";
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
import type { EducationItem, EducationMemory } from "@/lib/education";
import { EDUCATION_TYPES } from "@/lib/about-constants";
import { ImageIcon, Plus, Trash2 } from "lucide-react";

interface AboutFormEducationProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

export function AboutFormEducation({ items, onChange }: AboutFormEducationProps) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateItem = (index: number, item: Partial<EducationItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...item };
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        period: "",
        institution: "",
        description: "",
        type: "大学",
        memories: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("section", "education");
      form.append("subId", `item-${index}`);
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("アップロードに失敗しました");
      const { url } = await res.json();
      updateItem(index, { image: url });
    } catch (err) {
      console.error(err);
    }
  };

  const updateMemory = (
    itemIndex: number,
    memIndex: number,
    upd: Partial<EducationMemory>
  ) => {
    const item = items[itemIndex];
    const memories = [...(item.memories ?? [])];
    memories[memIndex] = { ...(memories[memIndex] ?? { text: "" }), ...upd };
    updateItem(itemIndex, { memories });
  };

  const addMemory = (itemIndex: number) => {
    const item = items[itemIndex];
    const memories = [...(item.memories ?? []), { text: "" }];
    updateItem(itemIndex, { memories });
  };

  const removeMemory = (itemIndex: number, memIndex: number) => {
    const item = items[itemIndex];
    const memories = (item.memories ?? []).filter((_, i) => i !== memIndex);
    updateItem(itemIndex, { memories });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={items.map((_, i) => `item-${i}`)} className="space-y-1">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-2">
                <span className="font-medium">
                  項目 {index + 1}
                  {item.institution && (
                    <span className="ml-2 text-muted-foreground">
                      — {item.institution}
                    </span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>期間</Label>
              <Input
                value={item.period}
                onChange={(e) => updateItem(index, { period: e.target.value })}
                placeholder="2024年 - 現在"
              />
            </div>
            <div className="grid gap-2">
              <Label>種別</Label>
              <Select
                value={item.type}
                onValueChange={(v) => updateItem(index, { type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label>学校名</Label>
            <Input
              value={item.institution}
              onChange={(e) => updateItem(index, { institution: e.target.value })}
              placeholder="名古屋大学 理学部物理学科"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label>説明（任意）</Label>
            <Input
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="2028年3月卒業予定"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label>写真（ホバー・モーダル）</Label>
            <div className="flex items-center gap-4">
              <input
                ref={(el) => {
                  fileRefs.current[`img-${index}`] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, index)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRefs.current[`img-${index}`]?.click()}
              >
                <ImageIcon className="mr-1 h-4 w-4" />
                アップロード
              </Button>
              {item.image && (
                <>
                  <div className="h-12 w-16 overflow-hidden rounded border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItem(index, { image: undefined, imageAlt: undefined })}
                  >
                    削除
                  </Button>
                </>
              )}
            </div>
            {item.image && (
              <Input
                value={item.imageAlt ?? ""}
                onChange={(e) => updateItem(index, { imageAlt: e.target.value || undefined })}
                placeholder="画像の代替テキスト"
              />
            )}
          </div>
          <div className="mt-4">
            <Label>思い出（モーダルで表示）</Label>
            <Accordion type="single" collapsible className="mt-2">
              {(item.memories ?? []).map((mem, mi) => (
                <AccordionItem key={mi} value={`mem-${index}-${mi}`}>
                  <AccordionTrigger>
                    思い出 {mi + 1}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <Textarea
                        value={mem.text}
                        onChange={(e) =>
                          updateMemory(index, mi, { text: e.target.value })
                        }
                        rows={2}
                        placeholder="思い出のエピソード"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemory(index, mi)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        削除
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => addMemory(index)}
            >
              <Plus className="mr-1 h-4 w-4" />
              思い出を追加
            </Button>
          </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button type="button" variant="outline" onClick={addItem}>
        <Plus className="mr-1 h-4 w-4" />
        学歴を追加
      </Button>
    </div>
  );
}
