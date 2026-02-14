import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";

const CONTENT_ABOUT_DIR = path.join(process.cwd(), "content/about");

const SECTIONS = [
  "hero",
  "bio",
  "education",
  "career",
  "hometown",
  "awards",
  "certifications",
  "skills",
  "values",
  "contact",
] as const;

type Section = (typeof SECTIONS)[number];

function isValidSection(s: string): s is Section {
  return (SECTIONS as readonly string[]).includes(s);
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let body: { section: string; data: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { section, data } = body;
  if (!section || typeof section !== "string") {
    return NextResponse.json(
      { error: "section is required" },
      { status: 400 }
    );
  }

  if (!isValidSection(section)) {
    return NextResponse.json(
      { error: `Invalid section: ${section}` },
      { status: 400 }
    );
  }

  const filename = `${section}.json`;
  const filePath = path.join(CONTENT_ABOUT_DIR, filename);

  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json, "utf8");
    return NextResponse.json({ ok: true, section });
  } catch (err) {
    console.error("save-about error:", err);
    return NextResponse.json(
      { error: "Failed to write file" },
      { status: 500 }
    );
  }
}
