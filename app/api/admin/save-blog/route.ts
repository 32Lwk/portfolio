import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { requireAdmin } from "@/lib/admin-auth";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog-constants";

const AUTHOR = "川嶋宥翔";
const CONTENT_BLOG_DIR = path.join(process.cwd(), "content/blog");
const PUBLIC_IMAGES_BLOG = path.join(process.cwd(), "public/images/blog");

function sanitizeSlug(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "post";
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let body: {
    slug: string;
    title: string;
    description: string;
    date: string;
    category: string;
    tags: string[];
    content: string;
    featured?: boolean;
    draft?: boolean;
    oldSlug?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    slug: rawSlug,
    title,
    description,
    date,
    category,
    tags,
    content,
    featured = false,
    draft = false,
    oldSlug,
  } = body;

  const slug = sanitizeSlug(rawSlug || "post");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  if (!BLOG_CATEGORIES.includes(category as BlogCategory)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const normalizedTags = Array.isArray(tags) ? tags : [];
  let finalContent = typeof content === "string" ? content : "";

  if (oldSlug && slug !== sanitizeSlug(oldSlug)) {
    const oldSlugSafe = sanitizeSlug(oldSlug);
    const oldImagesDir = path.join(PUBLIC_IMAGES_BLOG, oldSlugSafe);
    const newImagesDir = path.join(PUBLIC_IMAGES_BLOG, slug);

    if (fs.existsSync(oldImagesDir)) {
      if (!fs.existsSync(path.dirname(newImagesDir))) {
        fs.mkdirSync(path.dirname(newImagesDir), { recursive: true });
      }
      fs.renameSync(oldImagesDir, newImagesDir);
    }

    finalContent = finalContent.replace(
      new RegExp(`/images/blog/${oldSlugSafe.replace(/[-]/g, "[-]")}/`, "g"),
      `/images/blog/${slug}/`
    );

    const oldMdPath = path.join(CONTENT_BLOG_DIR, `${oldSlugSafe}.md`);
    if (fs.existsSync(oldMdPath)) {
      fs.unlinkSync(oldMdPath);
    }
  }

  const frontmatter = {
    title: title || "",
    description: description || "",
    date: date || new Date().toISOString().slice(0, 10),
    category,
    tags: normalizedTags,
    author: AUTHOR,
    slug,
    featured: Boolean(featured),
    draft: Boolean(draft),
  };

  const fileContent = matter.stringify(finalContent, frontmatter);
  const mdPath = path.join(CONTENT_BLOG_DIR, `${slug}.md`);

  if (!fs.existsSync(CONTENT_BLOG_DIR)) {
    fs.mkdirSync(CONTENT_BLOG_DIR, { recursive: true });
  }

  fs.writeFileSync(mdPath, fileContent, "utf8");

  return NextResponse.json({ ok: true, slug });
}
