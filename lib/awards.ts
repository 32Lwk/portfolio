import awardsData from "@/content/about/awards.json";

/** 大会の詳細リンク1件 */
export interface AwardLink {
  label?: string;
  url: string;
}

/** 感想1件に紐づく写真（複数可） */
export interface AwardMemoryImage {
  src: string;
  alt?: string;
}

/** 大会・賞歴の思い出1件 */
export interface AwardMemory {
  /** @deprecated 単一写真は images を使用 */
  image?: string;
  /** @deprecated 単一写真は images を使用 */
  imageAlt?: string;
  /** 感想の写真（複数） */
  images?: AwardMemoryImage[];
  text: string;
}

export interface AwardItem {
  period: string;
  title: string;
  /** 主催者・主催団体 */
  organizer?: string;
  /** 発表タイトル・内容 */
  description?: string;
  type: string;
  /** 賞の場合は順位・賞名など */
  result?: string;
  /** @deprecated 単一リンクは urls を使用 */
  url?: string;
  /** 詳細リンク（複数可） */
  urls?: AwardLink[];
  /** 大会の写真（モーダルで表示） */
  image?: string;
  imageAlt?: string;
  /** 大会での写真や感想（モーダルで表示） */
  memories?: AwardMemory[];
}

export function getAwards(): AwardItem[] {
  return awardsData as AwardItem[];
}
