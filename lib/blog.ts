import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: "技術" | "プロジェクト" | "学習" | "キャリア";
  tags: string[];
  author: string;
  featured?: boolean;
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

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        category: data.category || "技術",
        tags: data.tags || [],
        author: data.author || "川嶋宥翔",
        featured: data.featured || false,
        content,
      } as BlogPost;
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return undefined;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
        category: data.category || "技術",
      tags: data.tags || [],
      author: data.author || "川嶋宥翔",
      featured: data.featured || false,
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
