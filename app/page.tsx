import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { getFeaturedProjects } from "@/lib/projects";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { StructuredData } from "@/components/seo/StructuredData";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ParticleSimulation } from "@/components/animations/ParticleSimulation";

export default function Home() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <StructuredData type="Person" />
      <StructuredData type="WebSite" />
      <ParticleSimulation />
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 overflow-visible">
        {/* 背景グラデーション - 統一された設定 */}
        <div className="absolute inset-0 -z-10 overflow-visible">
          {/* 上部グラデーション */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/12 via-primary/6 via-primary/3 to-transparent blur-3xl" />
          {/* 下部グラデーション - セクション境界を超えて拡張 */}
          <div className="absolute -bottom-48 left-0 right-0 h-[500px] bg-gradient-to-b from-transparent via-primary/3 via-primary/6 to-primary/12 blur-3xl" />
          {/* 装飾的なグラデーション円 */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="mx-auto max-w-4xl text-center relative">
          <ScrollReveal>
            {/* バッジ */}
            <div className="mb-8 flex items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available for Opportunities
              </span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6">
              <span className="gradient-text animate-gradient">川嶋 宥翔</span>
            </h1>
            
            <div className="mb-8">
              <p className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                名古屋大学 理学部物理学科 2年生
              </p>
              <p className="text-lg sm:text-xl text-muted-foreground">
                フルスタックエンジニア / Webデザイナー
              </p>
            </div>
            
            <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
              「<span className="text-primary font-semibold">システムを誤らせない設計</span>」を最優先に、
              <br className="hidden sm:block" />
              医療×AI分野で個人開発に取り組んでいます。
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="group relative overflow-hidden">
                <Link href="/about" className="relative z-10 flex items-center">
                  About Me
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="group border-2">
                <Link href="/projects" className="flex items-center">
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            {/* スクロールインジケーター */}
            <div className="mt-16 animate-float">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-sm">Scroll to explore</span>
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 overflow-visible">
          {/* 背景グラデーション - 統一された設定 */}
          <div className="absolute inset-0 -z-10 overflow-visible">
            {/* 上部グラデーション - 前のセクションから拡張 */}
            <div className="absolute -top-48 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/12 via-primary/6 via-primary/3 to-transparent blur-3xl" />
            {/* 下部グラデーション - 次のセクションへ拡張 */}
            <div className="absolute -bottom-48 left-0 right-0 h-[500px] bg-gradient-to-b from-transparent via-primary/3 via-primary/6 to-primary/12 blur-3xl" />
            {/* 装飾的なグラデーション円 */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="mb-8 flex items-center justify-between relative z-10">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <Button variant="ghost" asChild>
              <Link href="/projects">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Blog Posts Section */}
      {latestPosts.length > 0 && (
        <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 overflow-visible">
          {/* 背景グラデーション - 統一された設定 */}
          <div className="absolute inset-0 -z-10 overflow-visible">
            {/* 上部グラデーション - 前のセクションから拡張 */}
            <div className="absolute -top-48 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/12 via-primary/6 via-primary/3 to-transparent blur-3xl" />
            {/* 下部グラデーション */}
            <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-b from-transparent via-primary/3 via-primary/6 to-primary/12 blur-3xl" />
            {/* 装飾的なグラデーション円 */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="mb-8 flex items-center justify-between relative z-10">
            <h2 className="text-3xl font-bold">Latest Blog Posts</h2>
            <Button variant="ghost" asChild>
              <Link href="/blog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
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
