import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BLOG_CATEGORIES, type BlogCategory } from "./blog-constants";

export { BLOG_CATEGORIES, type BlogCategory } from "./blog-constants";

const postsDirectory = path.join(process.cwd(), "content/blog");

/**
 * ブログの slug は「ファイル名から .md を除いた文字列」です。
 * 例: content/blog/medicine-recommend-physics-perspective.md → slug = "medicine-recommend-physics-perspective"
 * 記事URL: /blog/{slug} （例: /blog/medicine-recommend-physics-perspective）
 * フロントマターの slug は参照しておらず、ファイル名のみで決まります。
 */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  featured?: boolean;
  draft?: boolean;
  hidden?: boolean;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const category = BLOG_CATEGORIES.includes(data.category as BlogCategory)
        ? (data.category as BlogCategory)
        : "技術";

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        category,
        tags: data.tags || [],
        author: data.author || "川嶋宥翔",
        featured: data.featured || false,
        draft: data.draft ?? false,
        hidden: data.hidden ?? false,
        content,
      } as BlogPost;
    });

  const sorted = allPostsData
    .filter((post) => !post.draft && !post.hidden)
    .sort((a, b) => {
      if (a.date < b.date) return 1;
      return -1;
    });
  return sorted;
}

/** 管理画面用: draft を含む全記事を取得 */
export function getAllPostsForAdmin(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const category = BLOG_CATEGORIES.includes(data.category as BlogCategory)
        ? (data.category as BlogCategory)
        : "技術";

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        category,
        tags: data.tags || [],
        author: data.author || "川嶋宥翔",
        featured: data.featured || false,
        draft: data.draft ?? false,
        hidden: data.hidden ?? false,
        content,
      } as BlogPost;
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1;
    return -1;
  });
}

/** 管理画面用: 全記事からユニークなタグ一覧を取得 */
export function getAllTagsForAdmin(): string[] {
  const posts = getAllPostsForAdmin();
  const set = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (tag.trim()) set.add(tag.trim());
    }
  }
  return Array.from(set).sort();
}

/** 管理画面用: タグごとの記事数を取得（タグ管理ページ用） */
export function getTagsWithCount(): { tag: string; count: number }[] {
  const posts = getAllPostsForAdmin();
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const t = tag.trim();
      if (t) map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return undefined;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const category = BLOG_CATEGORIES.includes(data.category as BlogCategory)
      ? (data.category as BlogCategory)
      : "技術";

    const draft = data.draft ?? false;
    const hidden = data.hidden ?? false;
    if (draft || hidden) return undefined;

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      category,
      tags: data.tags || [],
      author: data.author || "川嶋宥翔",
      featured: data.featured || false,
      draft,
      hidden,
      content,
    } as BlogPost;
  } catch (error) {
    return undefined;
  }
}

/** 管理画面用: draft でも取得する（編集用） */
export function getPostBySlugForAdmin(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return undefined;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const category = BLOG_CATEGORIES.includes(data.category as BlogCategory)
      ? (data.category as BlogCategory)
      : "技術";

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      category,
      tags: data.tags || [],
      author: data.author || "川嶋宥翔",
      featured: data.featured || false,
      draft: data.draft ?? false,
      hidden: data.hidden ?? false,
      content,
    } as BlogPost;
  } catch (error) {
    return undefined;
  }
}

export function getPostsByCategory(
  category: BlogPost["category"]
): BlogPost[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getFeaturedPosts(): BlogPost[] {
  return getAllPosts().filter((post) => post.featured);
}

/** 公開記事のみからユニークなタグ一覧を取得 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const set = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (tag.trim()) set.add(tag.trim());
    }
  }
  return Array.from(set).sort();
}

/** 本文から最初の画像URLを取得（Markdown・HTML対応） */
export function getFirstImageFromContent(content: string): string | null {
  // Markdown形式: ![alt](url)
  const markdownMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownMatch?.[1]) return markdownMatch[1].trim();

  // HTML形式: <img src="...">
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1].trim();

  return null;
}
