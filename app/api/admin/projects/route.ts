import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";
import type { Project } from "@/lib/projects";

const PROJECTS_JSON_PATH = path.join(process.cwd(), "content/projects/projects.json");

const CATEGORIES = ["Web Application", "Algorithm", "Infrastructure", "Other"] as const;

function ensureArray<T>(x: unknown): T[] {
  if (Array.isArray(x)) return x as T[];
  return [];
}

function ensureString(x: unknown, fallback: string): string {
  return typeof x === "string" ? x : fallback;
}

/** 管理画面用: ファイルからプロジェクト一覧を読み取る */
function readProjectsFromFile(): Project[] {
  if (!fs.existsSync(PROJECTS_JSON_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(PROJECTS_JSON_PATH, "utf8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

/** バリデーションして Project 型に正規化 */
function normalizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const id = ensureString(o.id, "");
  const name = ensureString(o.name, "");
  const description = ensureString(o.description, "");
  const category = CATEGORIES.includes(o.category as (typeof CATEGORIES)[number])
    ? (o.category as Project["category"])
    : "Other";

  if (!id.trim() || !name.trim()) return null;

  const technologies = ensureArray<string>(o.technologies).filter((t) => typeof t === "string");
  const highlights = ensureArray<string>(o.highlights).filter((t) => typeof t === "string");

  const dateObj = o.date && typeof o.date === "object" ? (o.date as Record<string, unknown>) : {};
  const date = {
    start: ensureString(dateObj.start, new Date().toISOString().slice(0, 7)),
    end: typeof dateObj.end === "string" ? dateObj.end : undefined,
  };

  function normalizeMediaItem(m: unknown): { type: "image" | "video"; url: string; thumbnail?: string; alt: string; caption?: string } | null {
    if (!m || typeof m !== "object") return null;
    const x = m as Record<string, unknown>;
    const url = typeof x.url === "string" ? x.url : "";
    const alt = typeof x.alt === "string" ? x.alt : "";
    if (!url.trim() || !alt.trim()) return null;
    const type = x.type === "video" ? "video" as const : "image" as const;
    return {
      type,
      url,
      thumbnail: typeof x.thumbnail === "string" ? x.thumbnail : undefined,
      alt,
      caption: typeof x.caption === "string" ? x.caption : undefined,
    };
  }

  const subProjects = ensureArray<unknown>(o.subProjects)
    .map((sp) => {
      if (!sp || typeof sp !== "object") return null;
      const s = sp as Record<string, unknown>;
      const sid = ensureString(s.id, "");
      const sname = ensureString(s.name, "");
      if (!sid.trim() || !sname.trim()) return null;
      const sub: {
        id: string;
        name: string;
        description: string;
        technologies: string[];
        highlights: string[];
        image?: string;
        screenshots?: Array<{ type: "image" | "video"; url: string; thumbnail?: string; alt: string; caption?: string }>;
        videos?: Array<{ type: "image" | "video"; url: string; thumbnail?: string; alt: string; caption?: string }>;
      } = {
        id: sid,
        name: sname,
        description: ensureString(s.description, ""),
        technologies: ensureArray<string>(s.technologies).filter((t) => typeof t === "string"),
        highlights: ensureArray<string>(s.highlights).filter((t) => typeof t === "string"),
      };
      if (typeof s.image === "string" && s.image.trim()) sub.image = s.image.trim();
      if (Array.isArray(s.screenshots)) {
        const list = (s.screenshots as unknown[]).map(normalizeMediaItem).filter((x): x is NonNullable<typeof x> => x !== null);
        if (list.length) sub.screenshots = list;
      }
      if (Array.isArray(s.videos)) {
        const list = (s.videos as unknown[]).map((v) => {
          const item = normalizeMediaItem(v);
          return item ? { ...item, type: "video" as const } : null;
        }).filter((x): x is NonNullable<typeof x> => x !== null);
        if (list.length) sub.videos = list;
      }
      return sub;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const project: Project = {
    id: id.trim(),
    name: name.trim(),
    nameEn: typeof o.nameEn === "string" ? o.nameEn : undefined,
    description: description.trim(),
    category,
    technologies,
    image: typeof o.image === "string" ? o.image : undefined,
    githubUrl: typeof o.githubUrl === "string" ? o.githubUrl : undefined,
    demoUrl: typeof o.demoUrl === "string" ? o.demoUrl : undefined,
    featured: Boolean(o.featured),
    date,
    highlights,
    subProjects: subProjects.length > 0 ? subProjects : undefined,
  };

  if (o.technologyDetails && Array.isArray(o.technologyDetails)) {
    project.technologyDetails = (o.technologyDetails as Array<Record<string, unknown>>)
      .filter((t) => t && typeof t.name === "string")
      .map((t) => ({
        name: String(t.name),
        purpose: typeof t.purpose === "string" ? t.purpose : "",
        role: typeof t.role === "string" ? t.role : "",
      }));
  }
  if (o.screenshots && Array.isArray(o.screenshots)) {
    project.screenshots = (o.screenshots as Array<Record<string, unknown>>)
      .filter((s) => s && typeof s.url === "string" && typeof s.alt === "string")
      .map((s) => ({
        type: "image" as const,
        url: String(s.url),
        thumbnail: typeof s.thumbnail === "string" ? s.thumbnail : undefined,
        alt: String(s.alt),
        caption: typeof s.caption === "string" ? s.caption : undefined,
      }));
  }
  if (o.videos && Array.isArray(o.videos)) {
    project.videos = (o.videos as Array<Record<string, unknown>>)
      .filter((v) => v && typeof v.url === "string" && typeof v.alt === "string")
      .map((v) => ({
        type: "video" as const,
        url: String(v.url),
        thumbnail: typeof v.thumbnail === "string" ? v.thumbnail : undefined,
        alt: String(v.alt),
        caption: typeof v.caption === "string" ? v.caption : undefined,
      }));
  }
  if (o.stats && typeof o.stats === "object") {
    const st = o.stats as Record<string, unknown>;
    project.stats = {
      commits: typeof st.commits === "number" ? st.commits : undefined,
      developmentPeriod: typeof st.developmentPeriod === "string" ? st.developmentPeriod : undefined,
      technologyCount: typeof st.technologyCount === "number" ? st.technologyCount : undefined,
      linesOfCode: typeof st.linesOfCode === "number" ? st.linesOfCode : undefined,
      contributors: typeof st.contributors === "number" ? st.contributors : undefined,
      languages: Array.isArray(st.languages)
        ? (st.languages as Array<Record<string, unknown>>)
            .filter((l) => l && typeof l.name === "string" && typeof l.percent === "number")
            .map((l) => ({ name: String(l.name), percent: Number(l.percent) }))
        : undefined,
    };
  }
  if (o.relatedLinks && Array.isArray(o.relatedLinks)) {
    const linkTypes = ["documentation", "api", "demo", "video", "other"] as const;
    project.relatedLinks = (o.relatedLinks as Array<Record<string, unknown>>)
      .filter((r) => r && typeof r.label === "string" && typeof r.url === "string")
      .map((r) => ({
        label: String(r.label),
        url: String(r.url),
        type: linkTypes.includes(r.type as (typeof linkTypes)[number])
          ? (r.type as (typeof linkTypes)[number])
          : "other",
      }));
  }

  return project;
}

export async function GET() {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;
  try {
    const projects = readProjectsFromFile();
    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to read projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isArray = Array.isArray(body);
  const rawList = isArray ? body : [body];
  const projects: Project[] = [];

  for (const raw of rawList) {
    const p = normalizeProject(raw);
    if (!p) {
      return NextResponse.json(
        { error: "Invalid project: id and name are required" },
        { status: 400 }
      );
    }
    projects.push(p);
  }

  const dir = path.dirname(PROJECTS_JSON_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(
      PROJECTS_JSON_PATH,
      JSON.stringify(projects, null, 2),
      "utf8"
    );
    return NextResponse.json({ ok: true, count: projects.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to write projects" }, { status: 500 });
  }
}
