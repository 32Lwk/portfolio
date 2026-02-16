/**
 * ブラウザ専用: HEIC/HEIF を JPEG に変換する。
 * サーバーが HEIC 非対応でもアップロードできるように、クライアントで変換してから送る。
 */

function isHeicFile(file: File): boolean {
  const type = (file.type ?? "").toLowerCase();
  const name = (file.name ?? "").toLowerCase();
  return (
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * HEIC/HEIF の場合はブラウザで JPEG に変換して返す。それ以外はそのまま返す。
 * ブラウザ環境でのみ使用すること（heic2any は Node では動かない）。
 */
export async function convertHeicToJpegIfNeeded(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!isHeicFile(file)) return file;

  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  const name = file.name.replace(/\.[^.]+$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}
