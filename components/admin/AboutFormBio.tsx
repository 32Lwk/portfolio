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
import type { BioData, BioBlock } from "@/lib/bio";
import { ImageIcon, Plus, Trash2 } from "lucide-react";

interface AboutFormBioProps {
  data: BioData;
  onChange: (data: BioData) => void;
}

export function AboutFormBio({ data, onChange }: AboutFormBioProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingIndexRef = useRef<number>(0);

  const blocks = data.blocks ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const afterIndex = pendingIndexRef.current;
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("section", "bio");
      form.append("subId", `block-${afterIndex}`);
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("アップロードに失敗しました");
      const { url } = await res.json();
      const newBlocks: BioBlock[] = [
        ...blocks.slice(0, afterIndex + 1),
        { type: "image", src: url, alt: "画像" },
        ...blocks.slice(afterIndex + 1),
      ];
      onChange({ blocks: newBlocks });
    } catch (err) {
      console.error(err);
    }
  };

  const triggerUpload = (afterIndex: number) => {
    pendingIndexRef.current = afterIndex;
    fileRef.current?.click();
  };

  const updateBlock = (index: number, block: BioBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = block;
    onChange({ blocks: newBlocks });
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange({ blocks: newBlocks });
  };

  const addTextBlock = (afterIndex: number) => {
    const newBlocks: BioBlock[] = [
      ...blocks.slice(0, afterIndex + 1),
      { type: "text", content: "" },
      ...blocks.slice(afterIndex + 1),
    ];
    onChange({ blocks: newBlocks });
  };

  return (
    <div className="space-y-4">
      <Label>段落・画像（順序で表示）</Label>
      <Accordion type="multiple" defaultValue={blocks.map((_, i) => `block-${i}`)} className="space-y-1">
        {blocks.map((block, index) => (
          <AccordionItem key={index} value={`block-${index}`} className="rounded-lg border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-2">
                <span className="font-medium">
                  {block.type === "text" ? `段落 ${index + 1}` : `画像 ${index + 1}`}
                  {block.type === "text" && block.content && (
                    <span className="ml-2 max-w-[200px] truncate text-muted-foreground">
                      — {block.content.length > 30 ? `${block.content.slice(0, 30)}...` : block.content}
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
                    removeBlock(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2">
          {block.type === "text" ? (
            <div className="space-y-2">
              <Textarea
                value={block.content}
                onChange={(e) =>
                  updateBlock(index, { ...block, content: e.target.value })
                }
                rows={4}
                placeholder="段落のテキスト"
              />
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerUpload(index)}
                >
                  <ImageIcon className="mr-1 h-4 w-4" />
                  下に画像を挿入
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTextBlock(index)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  下に段落を追加
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlock(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 overflow-hidden rounded border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.alt} className="h-full w-full object-cover" />
              </div>
              <Input
                value={block.alt}
                onChange={(e) =>
                  updateBlock(index, { ...block, alt: e.target.value })
                }
                placeholder="代替テキスト"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBlock(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button
        type="button"
        variant="outline"
        onClick={() => addTextBlock(Math.max(0, blocks.length - 1))}
      >
        <Plus className="mr-1 h-4 w-4" />
        段落を追加
      </Button>
    </div>
  );
}
