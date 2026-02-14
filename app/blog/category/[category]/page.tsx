import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";
import {
  getPostsByCategory,
  type BlogPost,
} from "@/lib/blog";
import { BlogList } from "@/components/blog/BlogList";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  if (!BLOG_CATEGORIES.includes(decodedCategory as BlogPost["category"])) {
    return { title: "Category Not Found" };
  }
  const posts = getPostsByCategory(decodedCategory as BlogPost["category"]);
  return {
    title: `カテゴリ: ${decodedCategory}`,
    description: `「${decodedCategory}」カテゴリのブログ記事一覧（${posts.length}件）`,
  };
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  if (!BLOG_CATEGORIES.includes(decodedCategory as BlogPost["category"])) {
    notFound();
  }

  const posts = getPostsByCategory(decodedCategory as BlogPost["category"]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">カテゴリ: {decodedCategory}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          「{decodedCategory}」の記事一覧（{posts.length}件）
        </p>
      </div>
      <BlogList posts={posts} />
    </div>
  );
}
