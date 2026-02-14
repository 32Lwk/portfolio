import awardsData from "@/content/about/awards.json";

/** 大会・賞歴の思い出1件 */
export interface AwardMemory {
  image?: string;
  imageAlt?: string;
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
  url?: string;
  /** 大会の写真（モーダルで表示） */
  image?: string;
  imageAlt?: string;
  /** 大会での写真や感想（モーダルで表示） */
  memories?: AwardMemory[];
}

export function getAwards(): AwardItem[] {
  return awardsData as AwardItem[];
}
