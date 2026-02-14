import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlugForAdmin, getAllTagsForAdmin, getAllPostsForAdmin } from "@/lib/blog";
import { BlogForm } from "@/components/admin/BlogForm";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlugForAdmin(slug);

  if (!post) {
    notFound();
  }

  const existingSlugs = getAllPostsForAdmin().map((p) => p.slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">編集: {post.title}</h2>
        {!post.draft && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer">
              サイトで見る
            </Link>
          </Button>
        )}
      </div>
      <BlogForm
        initial={{
          slug: post.slug,
          title: post.title,
          description: post.description,
          date: post.date,
          category: post.category,
          tags: post.tags,
          content: post.content,
          featured: post.featured,
          draft: post.draft,
        }}
        oldSlug={post.slug}
        existingTags={getAllTagsForAdmin()}
        existingSlugs={existingSlugs}
      />
    </div>
  );
}
