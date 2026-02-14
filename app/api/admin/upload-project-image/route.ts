import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin-auth";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const PUBLIC_IMAGES_PROJECTS = path.join(process.cwd(), "public/images/projects");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function sanitizeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "project";
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

  const projectId =
    (formData.get("projectId") as string | null)?.trim() ||
    request.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const subId = (formData.get("subId") as string | null)?.trim() || undefined;
  const safeProjectId = sanitizeId(projectId);
  const safeSubId = subId ? sanitizeId(subId) : undefined;

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

  const dir = safeSubId
    ? path.join(PUBLIC_IMAGES_PROJECTS, safeProjectId, "sub", safeSubId)
    : path.join(PUBLIC_IMAGES_PROJECTS, safeProjectId);
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

  const url = safeSubId
    ? `/images/projects/${safeProjectId}/sub/${safeSubId}/${baseName}.${ext}`
    : `/images/projects/${safeProjectId}/${baseName}.${ext}`;
  return NextResponse.json({ url });
}
