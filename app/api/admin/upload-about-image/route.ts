import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin-auth";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const PUBLIC_IMAGES_ABOUT = path.join(process.cwd(), "public/images/about");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const SECTIONS = [
  "hero",
  "bio",
  "education",
  "career",
  "hometown",
  "awards",
] as const;

function isValidSection(s: string): boolean {
  return (SECTIONS as readonly string[]).includes(s);
}

function sanitizeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9-_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "img";
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const section =
    (formData.get("section") as string | null)?.trim() ||
    request.nextUrl.searchParams.get("section")?.trim();
  if (!section || !isValidSection(section)) {
    return NextResponse.json(
      { error: "Valid section is required (hero, bio, education, career, hometown, awards)" },
      { status: 400 }
    );
  }

  const subId = (formData.get("subId") as string | null)?.trim() || undefined;

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "ファイルサイズは 5MB までです" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "画像ファイル（JPEG, PNG, GIF, WebP）のみアップロードできます" },
      { status: 400 }
    );
  }

  const dir = subId
    ? path.join(PUBLIC_IMAGES_ABOUT, section, sanitizeId(subId))
    : path.join(PUBLIC_IMAGES_ABOUT, section);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ext = "jpg";
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50)}`;
  const baseName = path.basename(name, path.extname(name));
  const outPath = path.join(dir, `${baseName}.${ext}`);

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    await sharp(buf)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(outPath);
  } catch (err) {
    console.error("sharp error:", err);
    return NextResponse.json(
      { error: "画像の処理に失敗しました" },
      { status: 500 }
    );
  }

  const url = subId
    ? `/images/about/${section}/${sanitizeId(subId)}/${baseName}.${ext}`
    : `/images/about/${section}/${baseName}.${ext}`;
  return NextResponse.json({ url });
}
