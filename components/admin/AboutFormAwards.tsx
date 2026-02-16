"use client";

import { useRef } from "react";
import { toast } from "sonner";
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
import type { AwardItem, AwardLink, AwardMemory } from "@/lib/awards";
import { AWARD_TYPES } from "@/lib/about-constants";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-to-jpeg";
import { ImageIcon, Plus, Trash2 } from "lucide-react";

interface AboutFormAwardsProps {
  items: AwardItem[];
  onChange: (items: AwardItem[]) => void;
}

export function AboutFormAwards({ items, onChange }: AboutFormAwardsProps) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateItem = (index: number, item: Partial<AwardItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...item };
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        period: "",
        title: "",
        type: "大会",
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
      const fileToUpload = await convertHeicToJpegIfNeeded(file);
      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("section", "awards");
      form.append("subId", `item-${index}`);
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = (data as { error?: string }).error ?? "アップロードに失敗しました";
        toast.error(message);
        return;
      }
      const { url } = data as { url: string };
      updateItem(index, { image: url });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "アップロードに失敗しました");
    }
  };

  const updateMemory = (
    itemIndex: number,
    memIndex: number,
    upd: Partial<AwardMemory>
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

  /** 感想の写真リスト（単一 image を images に正規化） */
  const getMemoryImages = (mem: AwardMemory) =>
    mem.images ?? (mem.image ? [{ src: mem.image, alt: mem.imageAlt }] : []);

  const handleMemoryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
    memIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const item = items[itemIndex];
    const mem = item.memories?.[memIndex] ?? { text: "" };
    const currentImages = getMemoryImages(mem);
    try {
      const fileToUpload = await convertHeicToJpegIfNeeded(file);
      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("section", "awards");
      form.append("subId", `item-${itemIndex}-mem-${memIndex}`);
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = (data as { error?: string }).error ?? "アップロードに失敗しました";
        toast.error(message);
        return;
      }
      const { url } = data as { url: string };
      updateMemory(itemIndex, memIndex, {
        images: [...currentImages, { src: url, alt: "" }],
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "アップロードに失敗しました");
    }
  };

  const removeMemoryImage = (itemIndex: number, memIndex: number, imgIndex: number) => {
    const item = items[itemIndex];
    const mem = item.memories?.[memIndex] ?? { text: "" };
    const currentImages = getMemoryImages(mem).filter((_, i) => i !== imgIndex);
    updateMemory(itemIndex, memIndex, { images: currentImages });
  };

  /** 詳細リンク一覧（単一 url を urls に正規化） */
  const getItemLinks = (item: AwardItem): AwardLink[] =>
    item.urls ?? (item.url ? [{ url: item.url }] : []);

  const setItemLinks = (itemIndex: number, links: AwardLink[]) => {
    updateItem(itemIndex, { urls: links });
  };

  const updateMemoryImageAlt = (
    itemIndex: number,
    memIndex: number,
    imgIndex: number,
    alt: string
  ) => {
    const item = items[itemIndex];
    const mem = item.memories?.[memIndex] ?? { text: "" };
    const currentImages = getMemoryImages(mem).map((img, i) =>
      i === imgIndex ? { ...img, alt: alt || undefined } : img
    );
    updateMemory(itemIndex, memIndex, { images: currentImages });
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
                  {item.title && (
                    <span className="ml-2 text-muted-foreground">— {item.title}</span>
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
                placeholder="2025年8月19日"
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
                  {AWARD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label>タイトル</Label>
            <Input
              value={item.title}
              onChange={(e) => updateItem(index, { title: e.target.value })}
              placeholder="AWS デジタル社会実現ツアー 2025 名古屋"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label>主催（任意）</Label>
            <Input
              value={item.organizer ?? ""}
              onChange={(e) => updateItem(index, { organizer: e.target.value || undefined })}
              placeholder="AWSジャパン"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label>説明（任意）</Label>
            <Input
              value={item.description ?? ""}
              onChange={(e) => updateItem(index, { description: e.target.value || undefined })}
              placeholder="発表タイトル・内容"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label>賞・順位（任意）</Label>
            <Input
              value={item.result ?? ""}
              onChange={(e) => updateItem(index, { result: e.target.value || undefined })}
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Label>詳細リンク（任意・複数可）</Label>
            <div className="space-y-2">
              {getItemLinks(item).map((link, linkIdx) => (
                <div key={linkIdx} className="flex flex-col gap-1 rounded border p-2 sm:flex-row sm:items-end sm:gap-2">
                  <Input
                    value={link.label ?? ""}
                    onChange={(e) => {
                      const links = [...getItemLinks(item)];
                      links[linkIdx] = { ...links[linkIdx], label: e.target.value || undefined };
                      setItemLinks(index, links);
                    }}
                    placeholder="ラベル（任意）"
                    className="sm:w-28"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const links = [...getItemLinks(item)];
                      links[linkIdx] = { ...links[linkIdx], url: e.target.value };
                      setItemLinks(index, links);
                    }}
                    placeholder="https://..."
                    className="min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 shrink-0 p-0"
                    onClick={() => {
                      const links = getItemLinks(item).filter((_, i) => i !== linkIdx);
                      setItemLinks(index, links);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItemLinks(index, [...getItemLinks(item), { url: "" }])}
              >
                <Plus className="mr-1 h-4 w-4" />
                リンクを追加
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label>大会の写真</Label>
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
          </div>
          <div className="mt-4">
            <Label>大会での様子・感想</Label>
            <Accordion type="single" collapsible className="mt-2">
              {(item.memories ?? []).map((mem, mi) => (
                <AccordionItem key={mi} value={`mem-${index}-${mi}`}>
                  <AccordionTrigger>感想 {mi + 1}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <Textarea
                        value={mem.text ?? ""}
                        onChange={(e) =>
                          updateMemory(index, mi, { text: e.target.value })
                        }
                        rows={2}
                        placeholder="大会での様子や感想"
                      />
                      <div className="space-y-2">
                        <Label className="text-xs">写真（複数可）</Label>
                        <input
                          ref={(el) => {
                            fileRefs.current[`mem-img-${index}-${mi}`] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleMemoryImageUpload(e, index, mi)}
                        />
                        <div className="flex flex-wrap items-end gap-3">
                          {getMemoryImages(mem).map((img, imgIdx) => (
                            <div key={imgIdx} className="flex flex-col gap-1">
                              <div className="h-16 w-20 overflow-hidden rounded border bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.src} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                              </div>
                              <Input
                                value={img.alt ?? ""}
                                onChange={(e) =>
                                  updateMemoryImageAlt(index, mi, imgIdx, e.target.value)
                                }
                                placeholder="代替テキスト"
                                className="h-8 w-20 text-xs"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-20 text-xs"
                                onClick={() => removeMemoryImage(index, mi, imgIdx)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                削除
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileRefs.current[`mem-img-${index}-${mi}`]?.click()}
                          >
                            <ImageIcon className="mr-1 h-4 w-4" />
                            写真を追加
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemory(index, mi)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        この感想を削除
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
              感想を追加
            </Button>
          </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button type="button" variant="outline" onClick={addItem}>
        <Plus className="mr-1 h-4 w-4" />
        大会・賞歴を追加
      </Button>
    </div>
  );
}
