import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";
import { compressImageToFile } from "@/lib/compress-image";
import { isAllowedImageFile } from "@/lib/upload-image-types";

const MAX_INPUT_BYTES = 50 * 1024 * 1024; // 50MB（アップロード後は自動圧縮で5MB以下に）
const PUBLIC_IMAGES_BLOG = path.join(process.cwd(), "public/images/blog");

function sanitizeSlug(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "post";
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

  const slug =
    (formData.get("slug") as string | null)?.trim() ||
    request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const safeSlug = sanitizeSlug(slug);

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (file.size > MAX_INPUT_BYTES) {
    return NextResponse.json(
      { error: "ファイルサイズは 50MB までです（自動で圧縮されます）" },
      { status: 400 }
    );
  }

  if (!isAllowedImageFile(file)) {
    return NextResponse.json(
      { error: "画像ファイル（JPG, JPEG, PNG, GIF, WebP, HEIC）のみアップロードできます" },
      { status: 400 }
    );
  }

  const dir = path.join(PUBLIC_IMAGES_BLOG, safeSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ext = "jpg";
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50)}`;
  const baseName = path.basename(name, path.extname(name));
  const outPath = path.join(dir, `${baseName}.${ext}`);

  const fileName = (file.name ?? "").toLowerCase();
  const isHeicFile =
    (file.type ?? "").toLowerCase().includes("heic") ||
    (file.type ?? "").toLowerCase().includes("heif") ||
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif");
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    await compressImageToFile(buf, outPath);
  } catch (err) {
    console.error("compress error:", err);
    const isHeic = isHeicFile;
    const message = isHeic
      ? "HEIC の変換に失敗しました。サーバーで HEIC に対応していない可能性があります。事前に JPEG に変換してからアップロードしてください。"
      : "画像の処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const url = `/images/blog/${safeSlug}/${baseName}.${ext}`;
  return NextResponse.json({ url });
}
