"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { BlogPost } from "@/lib/blog";
import type { BlogCategory } from "@/lib/blog-constants";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-to-jpeg";
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
import {
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  SquareCode,
  LayoutGrid,
  FileText,
} from "lucide-react";

const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

/** 新規記事用の初期スラッグ（YYYY-MM-DD-HH:mm） */
function getDefaultSlug(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}-${h}:${min}`;
}

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";
}

/** 本文から画像ブロックを抽出（Markdown と figure HTML） */
export type ContentImage = {
  match: string;
  url: string;
  alt: string;
  width: string;
  caption: string;
  type: "markdown" | "figure";
};

function parseImagesInContent(text: string): ContentImage[] {
  const result: ContentImage[] = [];
  // Markdown: ![alt](url)
  const mdRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(text)) !== null) {
    result.push({
      match: m[0],
      url: m[2].trim(),
      alt: (m[1] || "").trim(),
      width: "",
      caption: "",
      type: "markdown",
    });
  }
  // HTML figure: <figure ...><img src="..." alt="..." width="..." />...<figcaption>...</figcaption></figure>
  const figureRe = /<figure[^>]*>[\s\S]*?<img[^>]+>[\s\S]*?(?:<figcaption[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi;
  const decodeHtmlEntities = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  while ((m = figureRe.exec(text)) !== null) {
    const block = m[0];
    const srcMatch = block.match(/src=["']([^"']+)["']/i);
    const altMatch = block.match(/alt=["']([^"']*)["']/i);
    const widthMatch = block.match(/width=["']([^"']+)["']/i);
    const capMatch = m[1]; // figcaption content (with tags we strip)
    const url = srcMatch ? srcMatch[1].trim() : "";
    const alt = altMatch ? decodeHtmlEntities(altMatch[1].trim()) : "";
    const width = widthMatch ? widthMatch[1].trim() : "";
    const captionRaw = (capMatch || "").replace(/<[^>]+>/g, "").trim();
    const caption = decodeHtmlEntities(captionRaw);
    if (url) {
      result.push({ match: block, url, alt, width, caption, type: "figure" });
    }
  }
  return result;
}

export type BlogFormInitial = Partial<
  Pick<
    BlogPost,
    "slug" | "title" | "description" | "date" | "category" | "tags" | "content" | "featured" | "draft"
  >
> & { oldSlug?: string };

interface BlogFormProps {
  initial?: BlogFormInitial;
  oldSlug?: string;
  /** 既存タグ一覧（選択肢＋新規追加時の候補） */
  existingTags?: string[];
  /** 既存記事のスラッグ一覧（重複警告用） */
  existingSlugs?: string[];
  onSuccess?: () => void;
}

export function BlogForm({ initial, oldSlug, existingTags = [], existingSlugs = [], onSuccess }: BlogFormProps) {
  const [slug, setSlug] = useState(initial?.slug ?? getDefaultSlug());
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? DEFAULT_DATE);
  const [category, setCategory] = useState<BlogCategory>(
    (initial?.category as BlogCategory) ?? "技術"
  );
  const [tags, setTags] = useState<string[]>(
    Array.isArray(initial?.tags) ? [...initial.tags] : []
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [tagSelectValue, setTagSelectValue] = useState("");
  const [content, setContent] = useState(initial?.content ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [draft, setDraft] = useState(initial?.draft ?? false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [viewMode, setViewMode] = useState<"tab" | "split">("tab");
  const [imageAlt, setImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pendingImageAlt, setPendingImageAlt] = useState("");
  const [pendingImageWidth, setPendingImageWidth] = useState("");
  const [pendingImageCaption, setPendingImageCaption] = useState("");
  const [editingContentImageIndex, setEditingContentImageIndex] = useState<number | null>(null);
  const [editImageWidth, setEditImageWidth] = useState("");
  const [editImageCaption, setEditImageCaption] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slugPlaceholder = slugFromTitle(title) || "例: my-post";

  const dirty = useRef(true);
  useEffect(() => {
    dirty.current = true;
  }, [slug, title, description, date, category, tags, content, featured, draft]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (dirty.current) e.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const ta = contentRef.current;
    if (!ta) {
      setContent((c) => c + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    setContent(before + text + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [content]);

  const insertWrap = useCallback(
    (before: string, after: string) => {
      const ta = contentRef.current;
      if (!ta) {
        setContent((c) => c + before + after);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = content.slice(start, end);
      if (selected) {
        const next = content.slice(0, start) + before + selected + after + content.slice(end);
        setContent(next);
        setTimeout(() => {
          ta.focus();
          ta.setSelectionRange(start + before.length, end + before.length);
        }, 0);
      } else {
        const next = content.slice(0, start) + before + after + content.slice(end);
        setContent(next);
        setTimeout(() => {
          ta.focus();
          ta.setSelectionRange(start + before.length, start + before.length);
        }, 0);
      }
    },
    [content]
  );

  const insertCodeBlock = useCallback(() => {
    insertAtCursor("```\n\n```");
  }, [insertAtCursor]);

  const insertLink = useCallback(() => {
    const text = linkText.trim() || "リンク";
    const url = linkUrl.trim() || "#";
    insertAtCursor(`[${text}](${url})`);
    setLinkText("");
    setLinkUrl("");
    setLinkDialogOpen(false);
  }, [linkText, linkUrl, insertAtCursor]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      setTagSelectValue("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((x) => x !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const finalSlug = slug.trim() || slugFromTitle(title) || "post";
    if (!slug.trim()) {
      setError("スラッグを入力してください");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: finalSlug,
          title,
          description,
          date,
          category,
          tags,
          content,
          featured,
          draft,
          oldSlug: oldSlug || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `保存に失敗しました (${res.status})`);
      }
      setSuccess(true);
      dirty.current = false;
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !slug.trim()) return;
    e.target.value = "";
    setUploading(true);
    setError(null);
    try {
      const fileToUpload = await convertHeicToJpegIfNeeded(file);
      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("slug", slug.trim());
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "アップロードに失敗しました");
      }
      const { url } = await res.json();
      setPendingImageUrl(url);
      setPendingImageAlt(imageAlt.trim() || "画像");
      setPendingImageWidth("");
      setPendingImageCaption("");
      setImageOptionsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }, [slug, imageAlt]);

  const escapeHtmlAttr = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const insertImageWithOptions = useCallback(() => {
    const url = pendingImageUrl.trim();
    const alt = pendingImageAlt.trim() || "画像";
    const width = pendingImageWidth.trim();
    const caption = pendingImageCaption.trim();
    if (!url) return;
    if (!width && !caption) {
      insertAtCursor(`![${alt}](${url})`);
    } else {
      const widthAttr = width ? ` width="${width}"` : "";
      const figcaptionBlock =
        caption ?
          `\n  <figcaption className="text-sm text-center text-muted-foreground mt-2">${escapeHtml(caption)}</figcaption>\n`
        : "";
      const block = `\n<figure className="my-4 flex flex-col items-center">\n  <img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(alt)}"${widthAttr} />${figcaptionBlock}</figure>\n`;
      insertAtCursor(block);
    }
    setImageOptionsOpen(false);
    setPendingImageUrl("");
    setPendingImageAlt("");
    setPendingImageWidth("");
    setPendingImageCaption("");
  }, [
    pendingImageUrl,
    pendingImageAlt,
    pendingImageWidth,
    pendingImageCaption,
    insertAtCursor,
  ]);

  const contentImages = parseImagesInContent(content);
  const editingContentImage =
    editingContentImageIndex !== null ? contentImages[editingContentImageIndex] ?? null : null;

  const applyContentImageEdit = useCallback(() => {
    if (editingContentImageIndex === null || editingContentImageIndex >= contentImages.length) return;
    const img = contentImages[editingContentImageIndex];
    const width = editImageWidth.trim();
    const caption = editImageCaption.trim();
    let newBlock: string;
    if (!width && !caption && img.type === "markdown") {
      newBlock = img.match; // no change
    } else if (!width && !caption) {
      newBlock = `![${img.alt}](${img.url})`;
    } else {
      const widthAttr = width ? ` width="${width}"` : "";
      const figcaptionBlock =
        caption
          ? `\n  <figcaption className="text-sm text-center text-muted-foreground mt-2">${escapeHtml(caption)}</figcaption>\n`
          : "";
      newBlock = `\n<figure className="my-4 flex flex-col items-center">\n  <img src="${escapeHtmlAttr(img.url)}" alt="${escapeHtmlAttr(img.alt)}"${widthAttr} />${figcaptionBlock}</figure>\n`;
    }
    // 同じ画像が複数ある場合に備え、該当インデックスの出現位置だけを置換
    let pos = 0;
    for (let i = 0; i < editingContentImageIndex; i++) {
      const idx = content.indexOf(contentImages[i].match, pos);
      if (idx === -1) break;
      pos = idx + contentImages[i].match.length;
    }
    const start = content.indexOf(img.match, pos);
    const newContent =
      start === -1
        ? content.replace(img.match, newBlock)
        : content.slice(0, start) + newBlock + content.slice(start + img.match.length);
    setContent(newContent);
    setEditingContentImageIndex(null);
    setEditImageWidth("");
    setEditImageCaption("");
  }, [
    content,
    contentImages,
    editingContentImageIndex,
    editImageWidth,
    editImageCaption,
    escapeHtml,
    escapeHtmlAttr,
  ]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事のタイトル"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">スラッグ</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={slugPlaceholder}
        />
        <p className="text-xs text-muted-foreground">
          英小文字・数字・ハイフンのみ推奨。編集可能です。既存のスラッグと重複すると上書きされます（重複時は下に警告表示）。
        </p>
        {slug.trim() &&
          existingSlugs.includes(slug.trim()) &&
          slug.trim() !== (oldSlug ?? "") && (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              重複: このスラッグは既に別の記事で使われています。保存するとその記事を上書きします。
            </p>
          )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">概要</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="記事の概要"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">日付</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label>カテゴリ</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as BlogCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOG_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>タグ</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="hover:text-destructive"
                aria-label={`${t} を削除`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={tagSelectValue || undefined}
            onValueChange={(v) => {
              if (v && v !== "__placeholder__") addTag(v);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="既存タグを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__placeholder__" disabled>
                既存タグを選択
              </SelectItem>
              {existingTags
                .filter((t) => !tags.includes(t))
                .map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm">または</span>
          <Input
            placeholder="新規タグを入力"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(newTagInput);
                setNewTagInput("");
              }
            }}
            className="w-40"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addTag(newTagInput);
              setNewTagInput("");
            }}
          >
            追加
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="featured"
            checked={featured}
            onCheckedChange={(c) => setFeatured(c === true)}
          />
          <Label htmlFor="featured">注目記事</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="draft"
            checked={draft}
            onCheckedChange={(c) => setDraft(c === true)}
          />
          <Label htmlFor="draft">下書き</Label>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Label>本文（Markdown）</Label>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">表示:</span>
            <Button
              type="button"
              variant={viewMode === "tab" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tab")}
              title="タブで編集/プレビューを切り替え"
            >
              <FileText className="h-4 w-4 mr-1" />
              タブ
            </Button>
            <Button
              type="button"
              variant={viewMode === "split" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("split")}
              title="編集とプレビューを並べて表示"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              分割
            </Button>
            <span className="text-xs text-muted-foreground ml-2">
              {content.length} 文字
            </span>
          </div>
        </div>

        {/* ツールバー */}
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-muted/30 p-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => insertWrap("**", "**")} title="太字">
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertWrap("*", "*")} title="斜体">
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertWrap("`", "`")} title="コード">
            <Code className="h-4 w-4" />
          </Button>
          <span className="w-px h-5 bg-border mx-0.5" aria-hidden />
          <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("## ")} title="見出し2">
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("### ")} title="見出し3">
            <Heading3 className="h-4 w-4" />
          </Button>
          <span className="w-px h-5 bg-border mx-0.5" aria-hidden />
          <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("\n- ")} title="箇条書き">
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("\n1. ")} title="番号付きリスト">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("\n> ")} title="引用">
            <Quote className="h-4 w-4" />
          </Button>
          <span className="w-px h-5 bg-border mx-0.5" aria-hidden />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
            title="リンクを挿入"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          {slug.trim() ? (
            <>
              <Input
                placeholder="alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-20 h-8 text-xs"
                title="画像の代替テキスト"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
                disabled={uploading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="画像をアップロードして挿入"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                {uploading ? "送信中..." : "画像"}
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground px-2">スラッグ入力で画像挿入可</span>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={insertCodeBlock} title="コードブロック">
            <SquareCode className="h-4 w-4" />
          </Button>
        </div>

        {/* リンク挿入ダイアログ（ツールバー直下） */}
        {linkDialogOpen && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
            <Input
              placeholder="表示テキスト"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-32 h-8 text-sm"
            />
            <Input
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 min-w-[120px] h-8 text-sm"
            />
            <Button type="button" size="sm" onClick={insertLink}>
              挿入
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setLinkDialogOpen(false)}>
              キャンセル
            </Button>
          </div>
        )}

        {/* 画像オプション（サイズ・注記）ダイアログ */}
        {imageOptionsOpen && (
          <div className="rounded-md border border-input bg-background p-4 space-y-3">
            <p className="text-sm font-medium">画像の設定（任意で幅・注記を指定）</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={pendingImageUrl}
                  readOnly
                  className="h-8 text-sm bg-muted"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">代替テキスト（alt）</Label>
                <Input
                  value={pendingImageAlt}
                  onChange={(e) => setPendingImageAlt(e.target.value)}
                  placeholder="画像の説明"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">幅（% または px）</Label>
                <Input
                  value={pendingImageWidth}
                  onChange={(e) => setPendingImageWidth(e.target.value)}
                  placeholder="例: 100% または 600"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label className="text-xs">注記（キャプション）</Label>
                <Input
                  value={pendingImageCaption}
                  onChange={(e) => setPendingImageCaption(e.target.value)}
                  placeholder="画像の下に表示する説明文"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={insertImageWithOptions}>
                挿入
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImageOptionsOpen(false);
                  setPendingImageUrl("");
                  setPendingImageAlt("");
                  setPendingImageWidth("");
                  setPendingImageCaption("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* 表示: タブ or 分割 */}
        {viewMode === "tab" ? (
          <>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={previewTab === "edit" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewTab("edit")}
              >
                編集
              </Button>
              <Button
                type="button"
                variant={previewTab === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewTab("preview")}
              >
                プレビュー
              </Button>
            </div>
            {previewTab === "edit" ? (
              <Textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="font-mono text-sm"
                placeholder="# 見出し..."
              />
            ) : (
              <div className="min-h-[200px] rounded-md border border-input bg-muted/30 p-4 prose prose-sm dark:prose-invert max-w-none">
                <MarkdownPreview content={content} />
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[320px]">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">編集</span>
              <Textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="font-mono text-sm flex-1 min-h-[280px]"
                placeholder="# 見出し..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">プレビュー</span>
              <div className="flex-1 min-h-[280px] rounded-md border border-input bg-muted/30 p-4 prose prose-sm dark:prose-invert max-w-none overflow-auto">
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 本文内の画像：プレビュー＋サイズ・注記のGUI編集 */}
      {contentImages.length > 0 && (
        <div className="grid gap-2 rounded-md border border-input bg-muted/20 p-4">
          <Label>本文内の画像（サイズ・注記をGUIで編集）</Label>
          <div className="flex flex-wrap gap-4">
            {contentImages.map((img, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 rounded-lg border p-2 ${
                  editingContentImageIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <div className="relative">
                  <div className="h-20 w-24 overflow-hidden rounded bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || `画像${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <span className="max-w-[120px] truncate text-xs text-muted-foreground" title={img.url}>
                  {img.url.split("/").pop()}
                </span>
                <Button
                  type="button"
                  variant={editingContentImageIndex === index ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEditingContentImageIndex(index);
                    setEditImageWidth(img.width);
                    setEditImageCaption(img.caption);
                  }}
                >
                  {editingContentImageIndex === index ? "編集中" : "編集"}
                </Button>
              </div>
            ))}
          </div>
          {editingContentImage && (
            <div className="mt-4 grid gap-3 rounded-lg border border-primary/30 bg-background p-4">
              <p className="text-sm font-medium">
                編集: 画像 {editingContentImageIndex! + 1}（プレビュー上で選択中）
              </p>
              <div className="flex gap-4">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editingContentImage.url}
                    alt={editingContentImage.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <Label className="text-xs">幅（% または px）</Label>
                    <Input
                      value={editImageWidth}
                      onChange={(e) => setEditImageWidth(e.target.value)}
                      placeholder="例: 100% または 600"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">注記（キャプション）</Label>
                    <Input
                      value={editImageCaption}
                      onChange={(e) => setEditImageCaption(e.target.value)}
                      placeholder="画像の下に表示する説明"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={applyContentImageEdit}>
                  適用
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingContentImageIndex(null);
                    setEditImageWidth("");
                    setEditImageCaption("");
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">保存しました</p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) return <p className="text-muted-foreground">プレビュー</p>;
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[]}
      components={{
        figure: ({ children, className, ...props }) => (
          <figure
            {...props}
            className={`my-4 flex flex-col items-center ${className ?? ""}`.trim()}
          >
            {children}
          </figure>
        ),
        img: ({ src, alt, ...props }) => {
          if (!src || typeof src !== "string") return null;
          return (
            <span className="my-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ""}
                className="rounded-lg max-w-full"
                {...props}
              />
            </span>
          );
        },
        figcaption: ({ children, ...props }) => (
          <figcaption
            className="mt-2 text-center text-sm text-muted-foreground"
            {...props}
          >
            {children}
          </figcaption>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
