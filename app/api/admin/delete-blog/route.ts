import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";

const CONTENT_BLOG_DIR = path.join(process.cwd(), "content/blog");

function sanitizeSlug(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "post";
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.slug ? sanitizeSlug(body.slug) : "";
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const mdPath = path.join(CONTENT_BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  fs.unlinkSync(mdPath);
  return NextResponse.json({ ok: true });
}
