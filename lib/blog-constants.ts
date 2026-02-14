/** ブログで使用可能なカテゴリ一覧（日記は記事がなくてもフィルタに表示） */
export const BLOG_CATEGORIES = [
  "技術",
  "プロジェクト",
  "学習",
  "キャリア",
  "日記",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
