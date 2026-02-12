import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { getFeaturedProjects } from "@/lib/projects";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { StructuredData } from "@/components/seo/StructuredData";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export default function Home() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <StructuredData type="Person" />
      <StructuredData type="WebSite" />
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              川嶋宥翔
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              名古屋大学 理学部物理学科 2年生 / フルスタックエンジニア
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              「システムを誤らせない設計」を最優先に、医療×AI分野で個人開発に取り組んでいます。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/about">
                  About Me
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <Button variant="ghost" asChild>
              <Link href="/projects">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Blog Posts Section */}
      {latestPosts.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Latest Blog Posts</h2>
            <Button variant="ghost" asChild>
              <Link href="/blog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
