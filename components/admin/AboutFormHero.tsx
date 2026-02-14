"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HeroData } from "@/lib/hero";
import { ImageIcon } from "lucide-react";

interface AboutFormHeroProps {
  data: HeroData;
  onChange: (data: HeroData) => void;
}

export function AboutFormHero({ data, onChange }: AboutFormHeroProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("section", "hero");
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("アップロードに失敗しました");
      const { url } = await res.json();
      onChange({ ...data, image: url, imageAlt: data.imageAlt ?? data.name });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="hero-name">名前</Label>
        <Input
          id="hero-name"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="川嶋 宥翔"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hero-subtitle">サブタイトル</Label>
        <Input
          id="hero-subtitle"
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="名古屋大学 理学部物理学科 2年生 / フルスタックエンジニア"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hero-description">説明</Label>
        <Textarea
          id="hero-description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={2}
          placeholder="「システムを誤らせない設計」を最優先に..."
        />
      </div>
      <div className="grid gap-2">
        <Label>画像（名前の右側に表示）</Label>
        <div className="flex items-center gap-4">
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
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon className="mr-1 h-4 w-4" />
            画像をアップロード
          </Button>
          {data.image && (
            <>
              <div className="h-12 w-12 overflow-hidden rounded-full border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.image} alt="" className="h-full w-full object-cover" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...data, image: undefined, imageAlt: undefined })}
              >
                削除
              </Button>
            </>
          )}
        </div>
        {data.image && (
          <Input
            value={data.imageAlt ?? ""}
            onChange={(e) => onChange({ ...data, imageAlt: e.target.value || undefined })}
            placeholder="画像の代替テキスト"
          />
        )}
      </div>
    </div>
  );
}
