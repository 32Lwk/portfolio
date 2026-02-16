/**
 * アップロード許可する画像の MIME タイプ（小文字）
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];

/** HEIC は MIME が空になりがちなため、拡張子でも許可する */
const HEIC_EXTENSIONS = [".heic", ".heif"];

/**
 * ファイルが許可された画像形式かどうか。
 * - MIME タイプで判定（大文字小文字を区別しない）
 * - HEIC はブラウザ・OS によって MIME が空や application/octet-stream になることがあるため、
 *   拡張子が .heic / .heif の場合も許可する
 */
export function isAllowedImageFile(file: File): boolean {
  const mime = (file.type ?? "").toLowerCase().trim();
  if (mime && ALLOWED_MIME_TYPES.includes(mime)) return true;
  const name = (file.name ?? "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  if (HEIC_EXTENSIONS.includes(ext)) return true;
  return false;
}
