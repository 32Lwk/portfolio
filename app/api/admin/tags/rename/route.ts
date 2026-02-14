import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { requireAdmin } from "@/lib/admin-auth";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog-constants";

const CONTENT_BLOG_DIR = path.join(process.cwd(), "content/blog");
const AUTHOR = "川嶋宥翔";

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let body: { oldTag?: string; newTag?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { oldTag, newTag } = body;
  const oldT = typeof oldTag === "string" ? oldTag.trim() : "";
  const newT = typeof newTag === "string" ? newTag.trim() : "";

  if (!oldT || !newT) {
    return NextResponse.json({ error: "oldTag and newTag required" }, { status: 400 });
  }
  if (oldT === newT) {
    return NextResponse.json({ error: "oldTag and newTag must be different" }, { status: 400 });
  }

  if (!fs.existsSync(CONTENT_BLOG_DIR)) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const fileNames = fs.readdirSync(CONTENT_BLOG_DIR).filter((f) => f.endsWith(".md"));
  let updated = 0;

  for (const fileName of fileNames) {
    const fullPath = path.join(CONTENT_BLOG_DIR, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const tags = Array.isArray(data.tags) ? data.tags as string[] : [];
    if (!tags.includes(oldT)) continue;

    const newTags = tags.map((t) => (t === oldT ? newT : t));
    const category = BLOG_CATEGORIES.includes(data.category as BlogCategory)
      ? data.category
      : "技術";

    const frontmatter = {
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      category,
      tags: newTags,
      author: data.author || AUTHOR,
      slug: data.slug || fileName.replace(/\.md$/, ""),
      featured: data.featured || false,
      draft: data.draft ?? false,
    };

    const output = matter.stringify(content, frontmatter);
    fs.writeFileSync(fullPath, output, "utf8");
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
