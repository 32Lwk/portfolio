import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { requireAdmin } from "@/lib/admin-auth";

const CONTENT_BLOG_DIR = path.join(process.cwd(), "content/blog");

function sanitizeSlug(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "post";
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let body: {
    slugs: string[];
    hidden: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slugs, hidden } = body;

  if (!Array.isArray(slugs) || slugs.length === 0) {
    return NextResponse.json({ error: "slugs array is required" }, { status: 400 });
  }

  if (typeof hidden !== "boolean") {
    return NextResponse.json({ error: "hidden must be a boolean" }, { status: 400 });
  }

  const results: { slug: string; success: boolean; error?: string }[] = [];

  for (const rawSlug of slugs) {
    const slug = sanitizeSlug(rawSlug);
    const mdPath = path.join(CONTENT_BLOG_DIR, `${slug}.md`);

    try {
      if (!fs.existsSync(mdPath)) {
        results.push({ slug, success: false, error: "File not found" });
        continue;
      }

      const fileContents = fs.readFileSync(mdPath, "utf8");
      const { data, content } = matter(fileContents);

      // hiddenフラグを更新
      const updatedFrontmatter = {
        ...data,
        hidden: hidden,
      };

      const fileContent = matter.stringify(content, updatedFrontmatter);
      fs.writeFileSync(mdPath, fileContent, "utf8");

      results.push({ slug, success: true });
    } catch (error) {
      results.push({
        slug,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  return NextResponse.json({
    ok: true,
    results,
    summary: {
      total: results.length,
      success: successCount,
      failed: failCount,
    },
  });
}
