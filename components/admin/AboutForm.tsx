"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FileText, LayoutGrid, ExternalLink, List, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { HeroData } from "@/lib/hero";
import type { BioData } from "@/lib/bio";
import type { EducationItem } from "@/lib/education";
import type { CareerItem } from "@/lib/career";
import type { HometownData } from "@/lib/hometown";
import type { AwardItem } from "@/lib/awards";
import type { ValuesData } from "@/lib/values";
import type { ContactData } from "@/lib/contact";
import type { Skill } from "@/lib/skills";
import { AboutFormHero } from "./AboutFormHero";
import { AboutFormBio } from "./AboutFormBio";
import { AboutFormEducation } from "./AboutFormEducation";
import { AboutFormHometown } from "./AboutFormHometown";
import { AboutFormCareer } from "./AboutFormCareer";
import { AboutFormAwards } from "./AboutFormAwards";
import { AboutFormCertifications } from "./AboutFormCertifications";
import { AboutFormSkills } from "./AboutFormSkills";
import { AboutFormValues } from "./AboutFormValues";
import { AboutFormContact } from "./AboutFormContact";
import { AboutPreview } from "./AboutPreview";
import { SingleSectionPreview } from "./SingleSectionPreview";
import { cn } from "@/lib/utils";

export interface AboutFormData {
  hero: HeroData;
  bio: BioData;
  education: EducationItem[];
  career: CareerItem[];
  hometown: HometownData;
  awards: AwardItem[];
  certifications: string[];
  skills: Skill[];
  values: ValuesData;
  contact: ContactData;
}

const SECTION_IDS = [
  "hero",
  "bio",
  "education",
  "hometown",
  "career",
  "awards",
  "certifications",
  "skills",
  "values",
  "contact",
] as const;

const SECTION_LABELS: Record<(typeof SECTION_IDS)[number], string> = {
  hero: "Hero",
  bio: "自己紹介",
  education: "学歴",
  hometown: "出身地",
  career: "経歴",
  awards: "大会・賞歴",
  certifications: "資格",
  skills: "スキル",
  values: "価値観",
  contact: "連絡先",
};

interface AboutFormProps {
  initial: AboutFormData;
}

export function AboutForm({ initial }: AboutFormProps) {
  const [data, setData] = useState<AboutFormData>(initial);
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [viewMode, setViewMode] = useState<"tab" | "split" | "inline">("split");
  const [activeSection, setActiveSection] = useState<string>("");
  const [tocOpen, setTocOpen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (moveEvent: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const ratio = Math.max(0.2, Math.min(0.8, x / rect.width));
      setSplitRatio(ratio);
    };
    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(`section-${id}`)).filter(
      Boolean
    ) as HTMLElement[];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveSection(id);
            break;
          }
        }
      },
      { rootMargin: "-100px 0px -66% 0px" }
    );
    sections.forEach((el) => observer.observe(el));
    return () => sections.forEach((el) => observer.unobserve(el));
  }, [viewMode, previewTab]);

  useEffect(() => {
    dirtyRef.current = dirtySections.size > 0;
  }, [dirtySections]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (dirtyRef.current) e.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const validateSection = useCallback((section: string): string | null => {
    const sectionData = data[section as keyof AboutFormData];
    switch (section) {
      case "hero":
        if (!sectionData || typeof sectionData !== "object") return "データがありません";
        const h = sectionData as HeroData;
        if (!h.name?.trim()) return "名前は必須です";
        if (!h.subtitle?.trim()) return "サブタイトルは必須です";
        if (!h.description?.trim()) return "説明は必須です";
        break;
      case "hometown":
        if (!sectionData || typeof sectionData !== "object") return "データがありません";
        const ht = sectionData as HometownData;
        if (!ht.title?.trim()) return "タイトルは必須です";
        if (!ht.description?.trim()) return "説明は必須です";
        break;
      case "education":
        const edu = sectionData as EducationItem[];
        if (!Array.isArray(edu)) return "データ形式が不正です";
        for (let i = 0; i < edu.length; i++) {
          const item = edu[i];
          if (!item.period?.trim()) return `学歴 ${i + 1}: 期間は必須です`;
          if (!item.institution?.trim()) return `学歴 ${i + 1}: 学校名は必須です`;
          if (!item.type?.trim()) return `学歴 ${i + 1}: 種別は必須です`;
        }
        break;
      case "career":
        const car = sectionData as CareerItem[];
        if (!Array.isArray(car)) return "データ形式が不正です";
        for (let i = 0; i < car.length; i++) {
          const item = car[i];
          if (!item.period?.trim()) return `経歴 ${i + 1}: 期間は必須です`;
          if (!item.title?.trim()) return `経歴 ${i + 1}: タイトルは必須です`;
          if (!item.type?.trim()) return `経歴 ${i + 1}: 種別は必須です`;
        }
        break;
      case "awards":
        const awd = sectionData as AwardItem[];
        if (!Array.isArray(awd)) return "データ形式が不正です";
        for (let i = 0; i < awd.length; i++) {
          const item = awd[i];
          if (!item.period?.trim()) return `大会 ${i + 1}: 期間は必須です`;
          if (!item.title?.trim()) return `大会 ${i + 1}: タイトルは必須です`;
          if (!item.type?.trim()) return `大会 ${i + 1}: 種別は必須です`;
        }
        break;
      case "values":
        if (!sectionData || typeof sectionData !== "object") return "データがありません";
        const v = sectionData as ValuesData;
        if (!v.motto?.trim()) return "モットーは必須です";
        if (!v.mottoDescription?.trim()) return "モットー説明は必須です";
        break;
    }
    return null;
  }, [data]);

  const handleSaveAll = useCallback(async () => {
    if (dirtySections.size === 0) return;
    const sections = Array.from(dirtySections);
    for (const section of sections) {
      const err = validateSection(section);
      if (err) {
        toast.error(`${SECTION_LABELS[section as keyof typeof SECTION_LABELS] ?? section}: ${err}`);
        return;
      }
    }
    setSavingAll(true);
    let failed = false;
    for (const section of sections) {
      try {
        const sectionData = data[section as keyof AboutFormData];
        const res = await fetch("/api/admin/save-about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, data: sectionData }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "保存に失敗しました");
        }
        setDirtySections((prev) => {
          const next = new Set(prev);
          next.delete(section);
          return next;
        });
      } catch (err) {
        toast.error(
          `${SECTION_LABELS[section as keyof typeof SECTION_LABELS] ?? section}: ${err instanceof Error ? err.message : "保存に失敗"}`
        );
        failed = true;
      }
    }
    if (!failed) {
      toast.success("すべて保存しました");
    }
    setSavingAll(false);
  }, [data, dirtySections, validateSection]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirtySections.size > 0) {
          handleSaveAll();
        }
      }
    },
    [dirtySections.size, handleSaveAll]
  );

  const markDirty = useCallback((section: string) => {
    setDirtySections((prev) => new Set(prev).add(section));
  }, []);

  const updateSection = useCallback(<K extends keyof AboutFormData>(
    section: K,
    updater: (prev: AboutFormData[K]) => AboutFormData[K]
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: updater(prev[section]),
    }));
    markDirty(section);
  }, [markDirty]);

  const handleSaveSection = useCallback(
    async (section: string) => {
      if (!dirtySections.has(section)) return;
      const err = validateSection(section);
      if (err) {
        toast.error(err);
        return;
      }
      setSavingSection(section);
      try {
        const sectionData = data[section as keyof AboutFormData];
        const res = await fetch("/api/admin/save-about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, data: sectionData }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "保存に失敗しました");
        }
        setDirtySections((prev) => {
          const next = new Set(prev);
          next.delete(section);
          return next;
        });
        toast.success(`${SECTION_LABELS[section as keyof typeof SECTION_LABELS] ?? section} を保存しました`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "保存に失敗しました");
      } finally {
        setSavingSection(null);
      }
    },
    [data, dirtySections, validateSection]
  );

  const scrollToSection = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [showTopButton, setShowTopButton] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tocContent = (
    <ul className="mt-6 space-y-2 text-sm">
      {SECTION_IDS.map((id) => (
        <li
          key={id}
          className={cn(
            "transition-colors",
            activeSection === id
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <button
            type="button"
            onClick={() => {
              scrollToSection(id);
              setTocOpen(false);
            }}
            className="flex items-center gap-2 text-left"
          >
            {SECTION_LABELS[id]}
            {dirtySections.has(id) && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                未保存
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {/* メインコンテンツ */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  aria-label="目次を開く"
                >
                  <List className="mr-1 h-4 w-4" />
                  目次
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>目次</SheetTitle>
                </SheetHeader>
                {tocContent}
              </SheetContent>
            </Sheet>
            <Button
              type="button"
              className="h-9"
              onClick={handleSaveAll}
              disabled={dirtySections.size === 0 || savingAll}
            >
              {savingAll ? "保存中..." : "すべて保存"}
            </Button>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href="/about" target="_blank" rel="noopener noreferrer">
                本番で確認
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={viewMode === "tab" ? "secondary" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => setViewMode("tab")}
            >
              <FileText className="mr-1 h-4 w-4" />
              タブ
            </Button>
            <Button
              type="button"
              variant={viewMode === "split" ? "secondary" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => setViewMode("split")}
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              分割
            </Button>
            <Button
              type="button"
              variant={viewMode === "inline" ? "secondary" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => setViewMode("inline")}
              title="アコーディオンで編集とプレビューを横並び表示"
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              インライン
            </Button>
          </div>
        </div>

        <div
          ref={splitContainerRef}
          className={cn(
            viewMode === "split" && "flex min-h-[60vh] lg:min-h-[calc(100vh-12rem)]",
            viewMode === "inline" && "min-h-[60vh] lg:min-h-[calc(100vh-12rem)]",
            viewMode === "tab" && "space-y-6"
          )}
        >
          {viewMode === "inline" ? (
            <div className="min-h-0 overflow-y-auto">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                編集箇所とプレビューを横並びで表示
              </p>
              <Accordion
                type="multiple"
                defaultValue={[...SECTION_IDS]}
                className="space-y-1"
              >
                {SECTION_IDS.map((id) => (
                  <AccordionItem
                    key={id}
                    value={id}
                    id={`section-${id}`}
                    className={cn(
                      "rounded-lg border px-3",
                      dirtySections.has(id)
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-transparent bg-background/50"
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-1 items-center justify-between pr-2">
                        <span className="font-semibold">{SECTION_LABELS[id]}</span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {dirtySections.has(id) && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                              未保存
                            </span>
                          )}
                          <span
                            role="button"
                            tabIndex={0}
                            aria-disabled={!dirtySections.has(id) || !!savingSection}
                            className={cn(
                              buttonVariants({ size: "sm", variant: "secondary" }),
                              (!dirtySections.has(id) || savingSection) &&
                                "pointer-events-none opacity-50"
                            )}
                            onClick={() => handleSaveSection(id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (dirtySections.has(id) && !savingSection) handleSaveSection(id);
                              }
                            }}
                          >
                            {savingSection === id ? "保存中..." : "保存"}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid min-h-[300px] grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="min-h-0 overflow-y-auto rounded border bg-muted/20 p-4">
                          {id === "hero" && <AboutFormHero data={data.hero} onChange={(v) => updateSection("hero", () => v)} />}
                          {id === "bio" && <AboutFormBio data={data.bio} onChange={(v) => updateSection("bio", () => v)} />}
                          {id === "education" && <AboutFormEducation items={data.education} onChange={(v) => updateSection("education", () => v)} />}
                          {id === "hometown" && <AboutFormHometown data={data.hometown} onChange={(v) => updateSection("hometown", () => v)} />}
                          {id === "career" && <AboutFormCareer items={data.career} onChange={(v) => updateSection("career", () => v)} />}
                          {id === "awards" && <AboutFormAwards items={data.awards} onChange={(v) => updateSection("awards", () => v)} />}
                          {id === "certifications" && <AboutFormCertifications items={data.certifications} onChange={(v) => updateSection("certifications", () => v)} />}
                          {id === "skills" && <AboutFormSkills skills={data.skills} onChange={(v) => updateSection("skills", () => v)} />}
                          {id === "values" && <AboutFormValues data={data.values} onChange={(v) => updateSection("values", () => v)} />}
                          {id === "contact" && <AboutFormContact data={data.contact} onChange={(v) => updateSection("contact", () => v)} />}
                        </div>
                        <div className="flex min-h-[300px] overflow-hidden rounded border">
                          <SingleSectionPreview sectionId={id} data={data} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : viewMode === "split" ? (
            <>
              {/* 編集エリア */}
              <div
                className="min-h-0 min-w-0 shrink-0 overflow-y-auto overflow-x-hidden rounded-l-lg border bg-muted/20 p-4"
                style={{ flexBasis: `${splitRatio * 100}%` }}
              >
                <Accordion
                  type="multiple"
                  defaultValue={[...SECTION_IDS]}
                  className="space-y-1"
                >
                  {SECTION_IDS.map((id) => (
                    <AccordionItem
                      key={id}
                      value={id}
                      id={`section-${id}`}
                      className={cn(
                        "rounded-lg border px-3",
                        dirtySections.has(id)
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-transparent bg-background/50"
                      )}
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-2">
                          <span className="font-semibold">
                            {SECTION_LABELS[id]}
                          </span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {dirtySections.has(id) && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                                未保存
                              </span>
                            )}
                            <span
                              role="button"
                              tabIndex={0}
                              aria-disabled={!dirtySections.has(id) || !!savingSection}
                              className={cn(
                                buttonVariants({ size: "sm", variant: "secondary" }),
                                (!dirtySections.has(id) || savingSection) &&
                                  "pointer-events-none opacity-50"
                              )}
                              onClick={() => handleSaveSection(id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  if (dirtySections.has(id) && !savingSection) handleSaveSection(id);
                                }
                              }}
                            >
                              {savingSection === id ? "保存中..." : "保存"}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {id === "hero" && (
                          <AboutFormHero
                            data={data.hero}
                            onChange={(v) => updateSection("hero", () => v)}
                          />
                        )}
                        {id === "bio" && (
                          <AboutFormBio
                            data={data.bio}
                            onChange={(v) => updateSection("bio", () => v)}
                          />
                        )}
                        {id === "education" && (
                          <AboutFormEducation
                            items={data.education}
                            onChange={(v) => updateSection("education", () => v)}
                          />
                        )}
                        {id === "hometown" && (
                          <AboutFormHometown
                            data={data.hometown}
                            onChange={(v) => updateSection("hometown", () => v)}
                          />
                        )}
                        {id === "career" && (
                          <AboutFormCareer
                            items={data.career}
                            onChange={(v) => updateSection("career", () => v)}
                          />
                        )}
                        {id === "awards" && (
                          <AboutFormAwards
                            items={data.awards}
                            onChange={(v) => updateSection("awards", () => v)}
                          />
                        )}
                        {id === "certifications" && (
                          <AboutFormCertifications
                            items={data.certifications}
                            onChange={(v) => updateSection("certifications", () => v)}
                          />
                        )}
                        {id === "skills" && (
                          <AboutFormSkills
                            skills={data.skills}
                            onChange={(v) => updateSection("skills", () => v)}
                          />
                        )}
                        {id === "values" && (
                          <AboutFormValues
                            data={data.values}
                            onChange={(v) => updateSection("values", () => v)}
                          />
                        )}
                        {id === "contact" && (
                          <AboutFormContact
                            data={data.contact}
                            onChange={(v) => updateSection("contact", () => v)}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* 幅調整ハンドル */}
              <div
                role="separator"
                aria-orientation="vertical"
                className="flex w-2 shrink-0 cursor-col-resize items-center justify-center border-x bg-muted/30 hover:bg-muted/50"
                onMouseDown={handleResizeStart}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* プレビューエリア */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border bg-background">
                <p className="mb-2 shrink-0 px-1 text-sm font-medium text-muted-foreground">
                  プレビュー（編集内容をリアルタイム反映）
                </p>
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded border">
                  <div className="@container p-4">
                    <AboutPreview data={data} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {(viewMode === "tab" && previewTab === "edit") && (
                <div className="space-y-1">
                  <Accordion
                    type="multiple"
                    defaultValue={[...SECTION_IDS]}
                    className="w-full"
                  >
                    {SECTION_IDS.map((id) => (
                      <AccordionItem
                        key={id}
                        value={id}
                        id={`section-${id}`}
                        className={cn(
                          "rounded-lg border px-3",
                          dirtySections.has(id)
                            ? "border-amber-500/50 bg-amber-500/5"
                            : "border-transparent bg-background/50"
                        )}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex flex-1 items-center justify-between pr-2">
                            <span className="font-semibold">{SECTION_LABELS[id]}</span>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {dirtySections.has(id) && (
                                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                                  未保存
                                </span>
                              )}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-disabled={!dirtySections.has(id) || !!savingSection}
                                className={cn(
                                  buttonVariants({ size: "sm", variant: "secondary" }),
                                  (!dirtySections.has(id) || savingSection) &&
                                    "pointer-events-none opacity-50"
                                )}
                                onClick={() => handleSaveSection(id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    if (dirtySections.has(id) && !savingSection) handleSaveSection(id);
                                  }
                                }}
                              >
                                {savingSection === id ? "保存中..." : "保存"}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {id === "hero" && <AboutFormHero data={data.hero} onChange={(v) => updateSection("hero", () => v)} />}
                          {id === "bio" && <AboutFormBio data={data.bio} onChange={(v) => updateSection("bio", () => v)} />}
                          {id === "education" && <AboutFormEducation items={data.education} onChange={(v) => updateSection("education", () => v)} />}
                          {id === "hometown" && <AboutFormHometown data={data.hometown} onChange={(v) => updateSection("hometown", () => v)} />}
                          {id === "career" && <AboutFormCareer items={data.career} onChange={(v) => updateSection("career", () => v)} />}
                          {id === "awards" && <AboutFormAwards items={data.awards} onChange={(v) => updateSection("awards", () => v)} />}
                          {id === "certifications" && <AboutFormCertifications items={data.certifications} onChange={(v) => updateSection("certifications", () => v)} />}
                          {id === "skills" && <AboutFormSkills skills={data.skills} onChange={(v) => updateSection("skills", () => v)} />}
                          {id === "values" && <AboutFormValues data={data.values} onChange={(v) => updateSection("values", () => v)} />}
                          {id === "contact" && <AboutFormContact data={data.contact} onChange={(v) => updateSection("contact", () => v)} />}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
              {(viewMode === "tab" && previewTab === "preview") && (
                <div className="space-y-2">
                  <p className="px-1 text-sm font-medium text-muted-foreground">プレビュー</p>
                  <div className="@container max-h-[70vh] overflow-auto rounded border bg-background p-4">
                    <AboutPreview data={data} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {viewMode === "tab" && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant={previewTab === "edit" ? "secondary" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => setPreviewTab("edit")}
            >
              編集
            </Button>
            <Button
              type="button"
              variant={previewTab === "preview" ? "secondary" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => setPreviewTab("preview")}
            >
              プレビュー
            </Button>
          </div>
        )}
      </div>

      {/* Topボタン（右下固定） */}
      {showTopButton && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full shadow-lg"
          onClick={scrollToTop}
          aria-label="ページトップへ"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
