import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog/BlogList";
import { getSiteUrl } from "@/lib/site-url";
import { getDefaultOgImage } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Blog",
  description: "技術記事、キャリア、学習記録、医療×ITに関するブログ記事一覧。",
  openGraph: {
    url: `${siteUrl}/blog`,
    title: "Blog | 川嶋 宥翔",
    description: "技術記事、キャリア、学習記録、医療×ITに関するブログ記事一覧。",
    type: "website",
    images: [getDefaultOgImage("川嶋 宥翔 | Blog")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | 川嶋 宥翔",
    description: "技術記事、キャリア、学習記録、医療×ITに関するブログ記事一覧。",
    images: ["/og_image.png"],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-2 text-lg text-muted-foreground">
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
