import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function requireAdmin() {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "Admin key not configured" }, { status: 500 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { imagePath } = await request.json();

    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json(
        { error: "imagePath is required", exists: false },
        { status: 400 }
      );
    }

    // 外部URLの場合は存在確認をスキップ
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return NextResponse.json({ exists: true, isExternal: true });
    }

    // パスを正規化（先頭の/を削除）
    const normalizedPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    const fullPath = path.join(PUBLIC_DIR, normalizedPath);

    // パストラバーサル攻撃を防ぐ
    if (!fullPath.startsWith(PUBLIC_DIR)) {
      return NextResponse.json(
        { error: "Invalid path", exists: false },
        { status: 400 }
      );
    }

    // ファイルの存在確認
    const exists = fs.existsSync(fullPath);

    if (exists) {
      // ファイルが存在する場合、実際に画像ファイルか確認
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json({ exists: false, error: "Path is not a file" });
      }
    }

    return NextResponse.json({ exists, path: normalizedPath });
  } catch (error) {
    console.error("Error checking image:", error);
    return NextResponse.json(
      { error: "Failed to check image", exists: false },
      { status: 500 }
    );
  }
}
