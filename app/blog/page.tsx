import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Blog",
  description: "技術記事、キャリア、学習記録、医療×ITに関するブログ記事一覧。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          技術記事、キャリア、学習記録、医療×ITに関する記事
        </p>
      </div>
      {posts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">記事がまだありません。</p>
        </div>
      ) : (
        <BlogList posts={posts} />
      )}
    </div>
  );
}
