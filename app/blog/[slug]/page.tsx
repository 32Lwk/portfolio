import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, getFirstImageFromContent } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { TocProvider } from "@/components/blog/TocContext";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { TocMobileButton } from "@/components/blog/TocMobileButton";
import { BlogNavigation } from "@/components/blog/BlogNavigation";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { StructuredData } from "@/components/seo/StructuredData";
import { mdxComponents } from "@/components/blog/MdxComponents";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://kawashimayuto.dev";
  const postUrl = `${baseUrl}/blog/${slug}`;

  const firstImage = getFirstImageFromContent(post.content);
  let ogImage: string | undefined;
  if (firstImage) {
    ogImage =
      firstImage.startsWith("/") || firstImage.startsWith("http")
        ? firstImage.startsWith("/")
          ? `${baseUrl}${firstImage}`
          : firstImage
        : undefined;
  }

  return {
    title: post.title,
    description: post.description,
    ...(ogImage && {
      openGraph: {
        title: post.title,
        description: post.description,
        url: postUrl,
        images: [{ url: ogImage }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: [ogImage],
      },
    }),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kawashimayuto.dev";
  const postUrl = `${baseUrl}/blog/${slug}`;

  return (
    <>
      <StructuredData type="Article" data={post} />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <TocProvider>
          <TocMobileButton />
          <div className="flex flex-col lg:flex-row gap-8">
            <TableOfContents />
            <article className="flex-1 min-w-0">
              <header className="mb-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{post.category}</Badge>
              <time className="text-sm text-muted-foreground">
                {format(new Date(post.date), "yyyy年MM月dd日", { locale: ja })}
              </time>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">{post.title}</h1>
            {post.description && (
              <p className="mt-4 text-lg text-muted-foreground">
                {post.description}
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ShareButtons title={post.title} url={postUrl} />
                </div>
              </header>
          <div className="prose prose-slate dark:prose-invert max-w-none min-w-0 break-words overflow-x-auto">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [],
                  rehypePlugins: [],
                },
              }}
            />
          </div>
          <BlogNavigation prevPost={prevPost} nextPost={nextPost} />
            </article>
          </div>
        </TocProvider>
      </div>
    </>
  );
}
