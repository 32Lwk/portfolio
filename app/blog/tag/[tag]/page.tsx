import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllTags,
  getPostsByTag,
} from "@/lib/blog";
import { BlogList } from "@/components/blog/BlogList";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const allTags = getAllTags();
  if (!allTags.includes(decodedTag)) {
    return { title: "Tag Not Found" };
  }
  const posts = getPostsByTag(decodedTag);
  return {
    title: `タグ: ${decodedTag}`,
    description: `「${decodedTag}」タグの付いたブログ記事一覧（${posts.length}件）`,
  };
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const allTags = getAllTags();
  if (!allTags.includes(decodedTag)) {
    notFound();
  }
  const posts = getPostsByTag(decodedTag);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">タグ: {decodedTag}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          「{decodedTag}」の記事一覧（{posts.length}件）
        </p>
      </div>
      <BlogList posts={posts} />
    </div>
  );
}
