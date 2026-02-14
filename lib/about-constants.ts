/** 学歴の種別プリセット */
export const EDUCATION_TYPES = [
  "大学",
  "高校",
  "中学校",
  "小学校",
  "保育所",
  "誕生",
] as const;

/** 経歴の種別プリセット */
export const CAREER_TYPES = [
  "職歴",
  "学習",
  "開発",
  "インターン",
  "その他",
] as const;

/** 大会・賞歴の種別プリセット */
export const AWARD_TYPES = ["大会", "コンテスト", "賞", "その他"] as const;

/** 価値観のアイコン */
export const VALUES_ICONS = ["Shield", "Code", "Users"] as const;

/** 連絡先アイコンのプリセット */
export const CONTACT_ICONS = [
  { value: "Github", label: "GitHub" },
  { value: "Linkedin", label: "LinkedIn" },
  { value: "Instagram", label: "Instagram" },
  { value: "Mail", label: "Email" },
  { value: "Twitter", label: "X (Twitter)" },
] as const;
