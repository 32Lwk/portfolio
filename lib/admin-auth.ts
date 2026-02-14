import { NextResponse } from "next/server";

/**
 * 管理画面が有効かどうか。
 * ENABLE_ADMIN=true かつ NODE_ENV=development のときのみ true。
 */
export function isAdminEnabled(): boolean {
  return (
    process.env.ENABLE_ADMIN === "true" &&
    process.env.NODE_ENV === "development"
  );
}

/**
 * 管理 API 用: 無効時は 403 を返す。
 * Route Handler の先頭で呼ぶ。
 */
export function requireAdmin(): NextResponse | null {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
