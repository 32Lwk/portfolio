"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HeroData } from "@/lib/hero";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-to-jpeg";
import { ImageIcon, Circle, Square, Move } from "lucide-react";

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
      const fileToUpload = await convertHeicToJpegIfNeeded(file);
      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("section", "hero");
      const res = await fetch("/api/admin/upload-about-image", {
        method: "POST",
        body: form,
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = (resData as { error?: string }).error ?? "アップロードに失敗しました";
        toast.error(message);
        return;
      }
      const { url } = resData as { url: string };
      onChange({ ...data, image: url, imageAlt: data.imageAlt ?? data.name });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "アップロードに失敗しました");
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
              <div
                className="h-12 w-12 overflow-hidden border bg-muted"
                style={{
                  borderRadius:
                    data.imageShape === "square"
                      ? (data.imageBorderRadiusPx ?? 0)
                      : "9999px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${data.imagePositionXPercent ?? 50}% ${data.imagePositionYPercent ?? 50}%`,
                  }}
                />
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
          <>
            <Input
              value={data.imageAlt ?? ""}
              onChange={(e) => onChange({ ...data, imageAlt: e.target.value || undefined })}
              placeholder="画像の代替テキスト"
            />
              <div className="grid gap-2">
                <Label>写真の形</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={(data.imageShape ?? "circle") === "circle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onChange({ ...data, imageShape: "circle" })}
                  >
                    <Circle className="mr-1 h-4 w-4" />
                    円形
                  </Button>
                  <Button
                    type="button"
                    variant={data.imageShape === "square" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onChange({ ...data, imageShape: "square" })}
                  >
                    <Square className="mr-1 h-4 w-4" />
                    四角形
                  </Button>
                </div>
              </div>
              {data.imageShape === "square" && (
                <div className="grid gap-2">
                  <Label htmlFor="hero-image-radius">角の丸み（px）</Label>
                  <Input
                    id="hero-image-radius"
                    type="number"
                    min={0}
                    max={999}
                    step={2}
                    value={data.imageBorderRadiusPx ?? 0}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(999, Number(e.target.value) || 0));
                      onChange({ ...data, imageBorderRadiusPx: v });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">0で直角、大きいほど丸く。円形に近づけるにはサイズの約半分以上</p>
                </div>
              )}
              <div className="grid gap-2">
                <Label className="flex items-center gap-1">
                  <Move className="h-4 w-4" />
                  切り取り位置
                </Label>
                <p className="text-xs text-muted-foreground">枠内で画像のどの部分を見せるか</p>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "中央", x: 50, y: 50 },
                    { label: "上", x: 50, y: 0 },
                    { label: "下", x: 50, y: 100 },
                    { label: "左", x: 0, y: 50 },
                    { label: "右", x: 100, y: 50 },
                  ].map(({ label, x, y }) => (
                    <Button
                      key={label}
                      type="button"
                      variant={
                        (data.imagePositionXPercent ?? 50) === x &&
                        (data.imagePositionYPercent ?? 50) === y
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        onChange({
                          ...data,
                          imagePositionXPercent: x,
                          imagePositionYPercent: y,
                        })
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="hero-pos-x" className="text-xs">
                      X（0=左〜100=右）
                    </Label>
                    <Input
                      id="hero-pos-x"
                      type="number"
                      min={0}
                      max={100}
                      value={data.imagePositionXPercent ?? 50}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        onChange({ ...data, imagePositionXPercent: v });
                      }}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="hero-pos-y" className="text-xs">
                      Y（0=上〜100=下）
                    </Label>
                    <Input
                      id="hero-pos-y"
                      type="number"
                      min={0}
                      max={100}
                      value={data.imagePositionYPercent ?? 50}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        onChange({ ...data, imagePositionYPercent: v });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="hero-image-size">画像サイズ（px）</Label>
                <Input
                  id="hero-image-size"
                  type="number"
                  min={48}
                  max={320}
                  step={8}
                  value={data.imageSizePx ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    onChange({ ...data, imageSizePx: v });
                  }}
                  placeholder="96〜128（未入力で自動）"
                />
                <p className="text-xs text-muted-foreground">48〜320。未入力時は96（スマホ）/128（PC）</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hero-image-border">枠線の太さ（px）</Label>
                <Input
                  id="hero-image-border"
                  type="number"
                  min={0}
                  max={16}
                  step={1}
                  value={data.imageBorderPx ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    onChange({ ...data, imageBorderPx: v });
                  }}
                  placeholder="2（未入力で2px）"
                />
                <p className="text-xs text-muted-foreground">0〜16。未入力時は2px</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
