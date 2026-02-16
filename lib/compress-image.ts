import fs from "fs";
import sharp from "sharp";

const MAX_OUTPUT_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * 画像をリサイズ・圧縮し、出力が指定サイズ以下になるようにしてファイルに保存する。
 * 品質・解像度を段階的に下げて再試行する。
 */
export async function compressImageToFile(
  inputBuffer: Buffer,
  outPath: string,
  maxBytes: number = MAX_OUTPUT_BYTES
): Promise<void> {
  const maxDimensions = [1200, 900, 600];
  const qualities = [85, 70, 55, 40];

  for (const maxDim of maxDimensions) {
    for (const quality of qualities) {
      const out = await sharp(inputBuffer)
        .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
      if (out.length <= maxBytes) {
        await fs.promises.writeFile(outPath, out);
        return;
      }
    }
  }

  // 最後の手段: 最小サイズ・低品質で保存
  const out = await sharp(inputBuffer)
    .resize(600, 600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 35 })
    .toBuffer();
  await fs.promises.writeFile(outPath, out);
}
