import awardsData from "@/content/about/awards.json";

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
}

export function getAwards(): AwardItem[] {
  return awardsData as AwardItem[];
}
