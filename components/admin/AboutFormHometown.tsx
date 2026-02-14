"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HometownData } from "@/lib/hometown";
import { ImageIcon, Plus, Trash2 } from "lucide-react";

interface AboutFormHometownProps {
  data: HometownData;
  onChange: (data: HometownData) => void;
}

export function AboutFormHometown({ data, onChange }: AboutFormHometownProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingIndexRef = useRef<number>(0);

  const images = data.images ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("section", "hometown");
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("アップロードに失敗しました");
      const { url } = await res.json();
      const idx = pendingIndexRef.current;
      const newImages = [...images];
      if (idx >= 0 && idx <= newImages.length) {
        newImages.splice(idx, 0, { src: url, alt: "画像" });
      } else {
        newImages.push({ src: url, alt: "画像" });
      }
      onChange({ ...data, images: newImages });
    } catch (err) {
      console.error(err);
    }
  };

  const updateImage = (index: number, upd: { src?: string; alt?: string }) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], ...upd };
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...data, images: newImages });
  };

  const addImage = () => {
    pendingIndexRef.current = images.length;
    fileRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>タイトル</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="和歌山県有田郡有田川町"
        />
      </div>
      <div className="grid gap-2">
        <Label>バッジ（任意）</Label>
        <Input
          value={data.badge ?? ""}
          onChange={(e) => onChange({ ...data, badge: e.target.value || undefined })}
          placeholder="出身地"
        />
      </div>
      <div className="grid gap-2">
        <Label>バッジラベル（任意）</Label>
        <Input
          value={data.badgeLabel ?? ""}
          onChange={(e) => onChange({ ...data, badgeLabel: e.target.value || undefined })}
          placeholder="生まれ育った町"
        />
      </div>
      <div className="grid gap-2">
        <Label>説明</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={4}
          placeholder="山椒が有名で美しい町です..."
        />
      </div>
      <div className="grid gap-2">
        <Label>画像</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <div className="flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-20 w-24 overflow-hidden rounded border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
              </div>
              <Input
                value={img.alt}
                onChange={(e) => updateImage(i, { alt: e.target.value })}
                placeholder="代替テキスト"
                className="w-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="mr-1 h-4 w-4" />
            画像を追加
          </Button>
        </div>
      </div>
    </div>
  );
}
