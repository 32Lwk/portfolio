import heroData from "@/content/about/hero.json";

export interface HeroData {
  name: string;
  subtitle: string;
  description: string;
  image?: string;
  imageAlt?: string;
  /** プロフィール画像の表示サイズ（px）。未指定時は 96（スマホ）/ 128（PC） */
  imageSizePx?: number;
  /** プロフィール画像の枠線の太さ（px）。未指定時は 2 */
  imageBorderPx?: number;
  /** 写真の形。未指定時は circle */
  imageShape?: "circle" | "square";
  /** 四角形の場合の角の丸み（px）。未指定時は 0。circle の場合は無視 */
  imageBorderRadiusPx?: number;
  /** 画像の切り取り位置 X（%）。0=左、50=中央、100=右。未指定時は 50 */
  imagePositionXPercent?: number;
  /** 画像の切り取り位置 Y（%）。0=上、50=中央、100=下。未指定時は 50 */
  imagePositionYPercent?: number;
}

export function getHero(): HeroData {
  return heroData as HeroData;
}
