/**
 * サイトの正規URL（本番: NEXT_PUBLIC_SITE_URL、未設定時はフォールバック）
 * sitemap / robots / metadata / OGP / RSS などで一元利用
 */
const SITE_URL_FALLBACK = "https://www.yutok.dev";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK;
}
