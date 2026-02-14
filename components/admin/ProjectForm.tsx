"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Project, SubProject, MediaItem } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CATEGORIES = ["Web Application", "Algorithm", "Infrastructure", "Other"] as const;

function arrayToLines(arr: string[]): string {
  return (arr || []).join("\n");
}
function linesToArray(s: string): string[] {
  return s
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

interface ProjectFormProps {
  initial: Project | null;
  onSuccess?: () => void;
}

export function ProjectForm({ initial, onSuccess }: ProjectFormProps) {
  const [id, setId] = useState(initial?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<Project["category"]>(
    initial?.category ?? "Web Application"
  );
  const [technologies, setTechnologies] = useState(arrayToLines(initial?.technologies ?? []));
  const [image, setImage] = useState(initial?.image ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(initial?.demoUrl ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [dateStart, setDateStart] = useState(initial?.date?.start ?? "");
  const [dateEnd, setDateEnd] = useState(initial?.date?.end ?? "");
  const [highlights, setHighlights] = useState(arrayToLines(initial?.highlights ?? []));
  const [subProjects, setSubProjects] = useState<SubProject[]>(
    initial?.subProjects ? [...initial.subProjects] : []
  );
  const [screenshots, setScreenshots] = useState<MediaItem[]>(
    initial?.screenshots ? [...initial.screenshots] : []
  );
  const [videos, setVideos] = useState<MediaItem[]>(
    initial?.videos ? [...initial.videos] : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const projectImageInputRef = useRef<HTMLInputElement>(null);
  const dirty = useRef(true);

  useEffect(() => {
    dirty.current = true;
  }, [
    id,
    name,
    nameEn,
    description,
    category,
    technologies,
    image,
    githubUrl,
    demoUrl,
    featured,
    dateStart,
    dateEnd,
    highlights,
    subProjects,
    screenshots,
    videos,
  ]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (dirty.current) e.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const buildProject = (): Project => ({
    id: id.trim() || "new-project",
    name: name.trim(),
    nameEn: nameEn.trim() || undefined,
    description: description.trim(),
    category,
    technologies: linesToArray(technologies),
    image: image.trim() || undefined,
    githubUrl: githubUrl.trim() || undefined,
    demoUrl: demoUrl.trim() || undefined,
    featured,
    date: { start: dateStart.trim() || "2025-01", end: dateEnd.trim() || undefined },
    highlights: linesToArray(highlights),
    subProjects: subProjects.length > 0 ? subProjects : undefined,
    technologyDetails: initial?.technologyDetails,
    screenshots: screenshots.length > 0 ? screenshots : undefined,
    videos: videos.length > 0 ? videos : undefined,
    stats: initial?.stats,
    performance: initial?.performance,
    relatedLinks: initial?.relatedLinks,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects");
      const current: Project[] = res.ok ? await res.json() : [];
      const next = initial
        ? current.map((p) => (p.id === initial.id ? buildProject() : p))
        : [...current, buildProject()];
      const saveRes = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        throw new Error(data.error || "保存に失敗しました");
      }
      dirty.current = false;
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const addSubProject = () => {
    setSubProjects((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        name: "",
        description: "",
        technologies: [],
        highlights: [],
      },
    ]);
  };

  const updateSubProject = (index: number, field: keyof SubProject, value: unknown) => {
    setSubProjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    subIndex: number
  ) => {
    const file = e.target.files?.[0];
    const sub = subProjects[subIndex];
    if (!file || !projectIdForUpload || !sub?.id) return;
    e.target.value = "";
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectIdForUpload);
      form.append("subId", sub.id);
      const res = await fetch("/api/admin/upload-project-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "アップロードに失敗しました");
      }
      const { url } = await res.json();
      updateSubProject(subIndex, "image", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleSubScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    subIndex: number,
    ssIndex: number
  ) => {
    const file = e.target.files?.[0];
    const sub = subProjects[subIndex];
    if (!file || !projectIdForUpload || !sub?.id) return;
    e.target.value = "";
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectIdForUpload);
      form.append("subId", sub.id);
      const res = await fetch("/api/admin/upload-project-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "アップロードに失敗しました");
      }
      const { url } = await res.json();
      const list = [...(sub.screenshots ?? [])];
      if (list[ssIndex]) list[ssIndex] = { ...list[ssIndex], url };
      else list.push({ type: "image", url, alt: "" });
      updateSubProject(subIndex, "screenshots", list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const addSubScreenshot = (subIndex: number) => {
    const sub = subProjects[subIndex];
    const list = [...(sub?.screenshots ?? []), { type: "image" as const, url: "", alt: "" }];
    updateSubProject(subIndex, "screenshots", list);
  };
  const updateSubScreenshot = (subIndex: number, ssIndex: number, field: keyof MediaItem, value: string) => {
    const sub = subProjects[subIndex];
    const list = [...(sub?.screenshots ?? [])];
    if (list[ssIndex]) list[ssIndex] = { ...list[ssIndex], [field]: value };
    updateSubProject(subIndex, "screenshots", list);
  };
  const removeSubScreenshot = (subIndex: number, ssIndex: number) => {
    const sub = subProjects[subIndex];
    const list = (sub?.screenshots ?? []).filter((_, j) => j !== ssIndex);
    updateSubProject(subIndex, "screenshots", list);
  };

  const addSubVideo = (subIndex: number) => {
    const sub = subProjects[subIndex];
    const list = [...(sub?.videos ?? []), { type: "video" as const, url: "", alt: "" }];
    updateSubProject(subIndex, "videos", list);
  };
  const updateSubVideo = (subIndex: number, vIndex: number, field: keyof MediaItem, value: string) => {
    const sub = subProjects[subIndex];
    const list = [...(sub?.videos ?? [])];
    if (list[vIndex]) list[vIndex] = { ...list[vIndex], [field]: value };
    updateSubProject(subIndex, "videos", list);
  };
  const removeSubVideo = (subIndex: number, vIndex: number) => {
    const sub = subProjects[subIndex];
    const list = (sub?.videos ?? []).filter((_, j) => j !== vIndex);
    updateSubProject(subIndex, "videos", list);
  };

  const removeSubProject = (index: number) => {
    setSubProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const projectIdForUpload = (initial?.id || id.trim()) || "";
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectIdForUpload) return;
    e.target.value = "";
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectIdForUpload);
      const res = await fetch("/api/admin/upload-project-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "アップロードに失敗しました");
      }
      const { url } = await res.json();
      setImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const addScreenshot = () => {
    setScreenshots((prev) => [...prev, { type: "image", url: "", alt: "" }]);
  };
  const updateScreenshot = (index: number, field: keyof MediaItem, value: string) => {
    setScreenshots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    setVideos((prev) => [...prev, { type: "video", url: "", alt: "" }]);
  };
  const updateVideo = (index: number, field: keyof MediaItem, value: string) => {
    setVideos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScreenshotImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file || !projectIdForUpload) return;
    e.target.value = "";
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectIdForUpload);
      const res = await fetch("/api/admin/upload-project-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "アップロードに失敗しました");
      }
      const { url } = await res.json();
      updateScreenshot(index, "url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="pid">ID（英数字・ハイフン）</Label>
        <Input
          id="pid"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="my-project"
          disabled={!!initial}
        />
        {initial && (
          <p className="text-xs text-muted-foreground">ID は変更できません</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="プロジェクト名"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nameEn">名前（英語）</Label>
        <Input
          id="nameEn"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Project Name (optional)"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <div className="grid gap-2">
        <Label>カテゴリ</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Project["category"])}
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
        <Label htmlFor="technologies">技術（1行1件）</Label>
        <Textarea
          id="technologies"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          rows={4}
          placeholder={"Python\nFlask\n..."}
        />
      </div>
      <div className="grid gap-2">
        <Label>トップ画像</Label>
        <div className="flex flex-wrap items-end gap-4">
          {projectIdForUpload ? (
            <>
              <input
                ref={projectImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProjectImageUpload}
                disabled={uploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => projectImageInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "アップロード中..." : "画像をアップロード"}
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">IDを入力すると画像をアップロードできます</span>
          )}
          <div className="flex-1 min-w-[200px]">
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/projects/... またはアップロード"
            />
          </div>
          {image && (
            <div className="w-24 h-24 rounded border overflow-hidden bg-muted flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="demoUrl">デモ URL</Label>
          <Input
            id="demoUrl"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="featured"
          checked={featured}
          onCheckedChange={(c) => setFeatured(c === true)}
        />
        <Label htmlFor="featured">注目プロジェクト</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="dateStart">開始日（YYYY-MM）</Label>
          <Input
            id="dateStart"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            placeholder="2025-04"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dateEnd">終了日（任意）</Label>
          <Input
            id="dateEnd"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            placeholder="2025-12"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="highlights">ハイライト（1行1件）</Label>
        <Textarea
          id="highlights"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          rows={5}
          placeholder={"独自アルゴリズムの実装\n..."}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium">スクリーンショット</h3>
          <Button type="button" variant="outline" size="sm" onClick={addScreenshot}>
            追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {screenshots.length === 0 ? (
            <p className="text-muted-foreground text-sm">スクリーンショットはありません</p>
          ) : (
            screenshots.map((ss, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">スクリーンショット {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeScreenshot(i)}
                  >
                    削除
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-1">
                    <Label>URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={ss.url}
                        onChange={(e) => updateScreenshot(i, "url", e.target.value)}
                        placeholder="/images/projects/..."
                      />
                      {projectIdForUpload && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`screenshot-file-${i}`}
                            onChange={(e) => handleScreenshotImageUpload(e, i)}
                            disabled={uploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`screenshot-file-${i}`)?.click()}
                            disabled={uploading}
                          >
                            アップロード
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Label>サムネイル（任意）</Label>
                    <Input
                      value={ss.thumbnail ?? ""}
                      onChange={(e) => updateScreenshot(i, "thumbnail", e.target.value)}
                      placeholder="/images/..."
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>alt（必須）</Label>
                    <Input
                      value={ss.alt}
                      onChange={(e) => updateScreenshot(i, "alt", e.target.value)}
                      placeholder="画像の説明"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>キャプション（任意）</Label>
                    <Input
                      value={ss.caption ?? ""}
                      onChange={(e) => updateScreenshot(i, "caption", e.target.value)}
                      placeholder="キャプション"
                    />
                  </div>
                </div>
                {ss.url && (
                  <div className="w-32 h-20 rounded border overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ss.url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium">動画</h3>
          <Button type="button" variant="outline" size="sm" onClick={addVideo}>
            追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {videos.length === 0 ? (
            <p className="text-muted-foreground text-sm">動画はありません（YouTube/VimeoのURLまたは動画ファイルURL）</p>
          ) : (
            videos.map((v, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">動画 {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeVideo(i)}
                  >
                    削除
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-1">
                    <Label>URL（YouTube / Vimeo / 動画ファイル）</Label>
                    <Input
                      value={v.url}
                      onChange={(e) => updateVideo(i, "url", e.target.value)}
                      placeholder="https://youtube.com/... または /images/..."
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>サムネイル（任意）</Label>
                    <Input
                      value={v.thumbnail ?? ""}
                      onChange={(e) => updateVideo(i, "thumbnail", e.target.value)}
                      placeholder="/images/..."
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>alt（必須）</Label>
                    <Input
                      value={v.alt}
                      onChange={(e) => updateVideo(i, "alt", e.target.value)}
                      placeholder="動画の説明"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>キャプション（任意）</Label>
                    <Input
                      value={v.caption ?? ""}
                      onChange={(e) => updateVideo(i, "caption", e.target.value)}
                      placeholder="キャプション"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium">サブプロジェクト</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSubProject}>
            追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {subProjects.length === 0 ? (
            <p className="text-muted-foreground text-sm">サブプロジェクトはありません</p>
          ) : (
            subProjects.map((sp, i) => (
              <Card key={sp.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">サブ {i + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeSubProject(i)}
                    >
                      削除
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Label>ID</Label>
                    <Input
                      value={sp.id}
                      onChange={(e) => updateSubProject(i, "id", e.target.value)}
                      placeholder="sub-id"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>名前</Label>
                    <Input
                      value={sp.name}
                      onChange={(e) => updateSubProject(i, "name", e.target.value)}
                      placeholder="サブプロジェクト名"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>説明</Label>
                    <Textarea
                      value={sp.description}
                      onChange={(e) => updateSubProject(i, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>技術（1行1件）</Label>
                    <Textarea
                      value={arrayToLines(sp.technologies)}
                      onChange={(e) =>
                        updateSubProject(i, "technologies", linesToArray(e.target.value))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>ハイライト（1行1件）</Label>
                    <Textarea
                      value={arrayToLines(sp.highlights)}
                      onChange={(e) =>
                        updateSubProject(i, "highlights", linesToArray(e.target.value))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2 border-t pt-4">
                    <Label>画像</Label>
                    <div className="flex flex-wrap items-end gap-2">
                      {projectIdForUpload && sp.id ? (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`sub-image-${i}`}
                            onChange={(e) => handleSubImageUpload(e, i)}
                            disabled={uploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`sub-image-${i}`)?.click()}
                            disabled={uploading}
                          >
                            アップロード
                          </Button>
                        </>
                      ) : null}
                      <Input
                        value={sp.image ?? ""}
                        onChange={(e) => updateSubProject(i, "image", e.target.value)}
                        placeholder="/images/projects/... またはアップロード"
                        className="flex-1 min-w-[180px]"
                      />
                      {(sp.image ?? "").trim() && (
                        <div className="w-16 h-16 rounded border overflow-hidden bg-muted flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sp.image!} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>スクリーンショット</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSubScreenshot(i)}>
                        追加
                      </Button>
                    </div>
                    {(sp.screenshots ?? []).length === 0 ? (
                      <p className="text-muted-foreground text-xs">なし</p>
                    ) : (
                      <div className="space-y-2">
                        {(sp.screenshots ?? []).map((ss, j) => (
                          <div key={j} className="rounded border p-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>SS {j + 1}</span>
                              <Button type="button" variant="ghost" size="sm" className="text-destructive h-7" onClick={() => removeSubScreenshot(i, j)}>削除</Button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Input
                                value={ss.url}
                                onChange={(e) => updateSubScreenshot(i, j, "url", e.target.value)}
                                placeholder="URL"
                                className="flex-1 min-w-[120px]"
                              />
                              {projectIdForUpload && sp.id && (
                                <>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`sub-ss-${i}-${j}`}
                                    onChange={(e) => handleSubScreenshotUpload(e, i, j)}
                                    disabled={uploading}
                                  />
                                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`sub-ss-${i}-${j}`)?.click()} disabled={uploading}>UP</Button>
                                </>
                              )}
                              <Input value={ss.alt} onChange={(e) => updateSubScreenshot(i, j, "alt", e.target.value)} placeholder="alt" className="w-24" />
                              <Input value={ss.thumbnail ?? ""} onChange={(e) => updateSubScreenshot(i, j, "thumbnail", e.target.value)} placeholder="thumb" className="w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>動画</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSubVideo(i)}>
                        追加
                      </Button>
                    </div>
                    {(sp.videos ?? []).length === 0 ? (
                      <p className="text-muted-foreground text-xs">なし</p>
                    ) : (
                      <div className="space-y-2">
                        {(sp.videos ?? []).map((v, j) => (
                          <div key={j} className="rounded border p-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>動画 {j + 1}</span>
                              <Button type="button" variant="ghost" size="sm" className="text-destructive h-7" onClick={() => removeSubVideo(i, j)}>削除</Button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Input value={v.url} onChange={(e) => updateSubVideo(i, j, "url", e.target.value)} placeholder="URL" className="flex-1 min-w-[120px]" />
                              <Input value={v.alt} onChange={(e) => updateSubVideo(i, j, "alt", e.target.value)} placeholder="alt" className="w-24" />
                              <Input value={v.thumbnail ?? ""} onChange={(e) => updateSubVideo(i, j, "thumbnail", e.target.value)} placeholder="thumb" className="w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {success && <p className="text-green-600 dark:text-green-400 text-sm">保存しました</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}
