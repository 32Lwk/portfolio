import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById, getAllProjects } from "@/lib/projects";
import { getAllPosts } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog/BlogCard";
import { StructuredData } from "@/components/seo/StructuredData";
import { ScreenshotImage } from "@/components/portfolio/ScreenshotImage";
import { SafeImage } from "@/components/portfolio/SafeImage";
import { Github, ExternalLink, ArrowLeft, Calendar, GitCommit, Code, Users, FileText, Video, Image as ImageIcon, Link as LinkIcon, Shield, Globe, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ProjectHistorySection } from "@/components/portfolio/ProjectHistorySection";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.name} | Projects`,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      type: "website",
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  // プロジェクトに関連するブログ記事を取得
  // プロジェクトIDやプロジェクト名を含むタグでフィルタリング
  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter((post) => {
    // プロジェクト名がタグに含まれている、またはプロジェクトIDがタグに含まれている
    const projectTags = [
      project.id,
      project.name.toLowerCase(),
      "医薬品相談ツール",
      "チャット型医薬品相談ツール",
      "medicine-recommend-system",
      "トラブルシューティング",
      "開発記録",
      "技術記事",
    ];
    
    // タグまたはカテゴリでマッチング
    const tagMatch = post.tags.some((tag) =>
      projectTags.some((projectTag) =>
        tag.toLowerCase().includes(projectTag.toLowerCase())
      )
    );
    
    // タイトルや説明にプロジェクト名が含まれているかチェック
    const titleMatch = project.name
      .split(" ")
      .some((word) => post.title.toLowerCase().includes(word.toLowerCase()));
    
    return tagMatch || titleMatch;
  });

  // プロジェクトの歴史（GitHubのREADMEから取得した情報を基に）
  const projectHistory = getProjectHistory(project.id);

  return (
    <>
      <StructuredData type="Project" data={project} />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projectsに戻る
          </Link>
        </Button>

        {/* Project Header */}
        <ScrollReveal>
          <div className="mb-12">
            <div className="mb-6 overflow-hidden rounded-lg shadow-md">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <SafeImage
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                  aspectRatio="aspect-video"
                />
              </div>
            </div>
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold sm:text-4xl">{project.name}</h1>
                <Badge variant="secondary">{project.category}</Badge>
              </div>
              <p className="mb-6 text-base text-muted-foreground sm:text-lg">
                {project.description}
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center text-sm">
                {project.date.start && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {project.date.start}
                      {project.date.end ? ` - ${project.date.end}` : " - 継続中"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <Button variant="outline" size="sm" className="h-9 whitespace-nowrap min-w-[100px]" asChild>
                      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2 shrink-0" />
                        GitHub
                      </Link>
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button variant="default" size="sm" className="h-9 whitespace-nowrap min-w-[100px]" asChild>
                      <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                        Demo
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">主な特徴</h2>
              <ul className="space-y-2">
                {project.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-primary">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          </ScrollReveal>
        )}

        {/* Project Statistics */}
        {project.stats && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">プロジェクト統計</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {project.stats.commits !== undefined && (
                  <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <GitCommit className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">コミット数</p>
                        <p className="text-2xl font-bold">{project.stats.commits.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {project.stats.developmentPeriod && (
                  <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">開発期間</p>
                        <p className="text-lg font-bold">{project.stats.developmentPeriod}</p>
                      </div>
                    </div>
                  </div>
                )}
                {project.stats.technologyCount !== undefined && (
                  <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">使用技術数</p>
                        <p className="text-2xl font-bold">{project.stats.technologyCount}</p>
                      </div>
                    </div>
                  </div>
                )}
                {project.stats.linesOfCode !== undefined && (
                  <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">コード行数</p>
                        <p className="text-2xl font-bold">{project.stats.linesOfCode.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {project.stats.contributors !== undefined && (
                  <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">コントリビューター</p>
                        <p className="text-2xl font-bold">{project.stats.contributors}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* 言語別の割合 */}
        {project.stats?.languages && project.stats.languages.length > 0 && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">言語別の割合</h2>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                  <Code className="h-5 w-5 text-primary" />
                  <span className="text-sm">リポジトリの言語構成（GitHub Languages 相当）</span>
                </div>
                <div className="space-y-3">
                  {project.stats.languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-4">
                      <span className="w-24 shrink-0 text-sm font-medium">{lang.name}</span>
                      <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/80 transition-all"
                          style={{ width: `${lang.percent}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                        {lang.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Technology Details */}
        {project.technologyDetails && project.technologyDetails.length > 0 && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">技術スタック詳細</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {project.technologyDetails.map((tech, index) => (
                  <div
                    key={index}
                    className="group rounded-lg border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {tech.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {tech.purpose}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tech.role}</p>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Screenshots & Videos */}
        {(project.screenshots && project.screenshots.length > 0) || (project.videos && project.videos.length > 0) ? (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">スクリーンショット・動画</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {project.screenshots?.map((screenshot, index) => (
                  <div key={index} className="group overflow-hidden rounded-lg border bg-card">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {screenshot.thumbnail ? (
                        <ScreenshotImage
                          src={screenshot.thumbnail}
                          alt={screenshot.alt}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <ScreenshotImage
                          src={screenshot.url}
                          alt={screenshot.alt}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                        <ImageIcon className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                    {screenshot.caption && (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">{screenshot.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
                {project.videos?.map((video, index) => {
                  // YouTubeやVimeoのURLかどうかをチェック
                  const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be');
                  const isVimeo = video.url.includes('vimeo.com');
                  const isDirectVideo = video.url.match(/\.(mp4|webm|ogg|mov)$/i);
                  
                  // YouTubeのURLを埋め込み用に変換
                  const getYouTubeEmbedUrl = (url: string) => {
                    if (url.includes('youtube.com/watch?v=')) {
                      return url.replace('watch?v=', 'embed/');
                    } else if (url.includes('youtu.be/')) {
                      const videoId = url.split('youtu.be/')[1].split('?')[0];
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                    return url;
                  };
                  
                  // VimeoのURLを埋め込み用に変換
                  const getVimeoEmbedUrl = (url: string) => {
                    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
                  };
                  
                  return (
                    <div key={index} className="group overflow-hidden rounded-lg border bg-card">
                      {isYouTube ? (
                        // YouTubeの埋め込み
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <iframe
                            src={getYouTubeEmbedUrl(video.url)}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={video.alt}
                          />
                        </div>
                      ) : isVimeo ? (
                        // Vimeoの埋め込み
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <iframe
                            src={getVimeoEmbedUrl(video.url)}
                            className="h-full w-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={video.alt}
                          />
                        </div>
                      ) : isDirectVideo ? (
                        // 直接動画ファイル
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <video
                            src={video.url}
                            controls
                            className="h-full w-full"
                            poster={video.thumbnail}
                          >
                            お使いのブラウザは動画タグをサポートしていません。
                          </video>
                        </div>
                      ) : (
                        // 通常の動画リンクまたはサムネイル
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          {video.thumbnail ? (
                            <Image
                              src={video.thumbnail}
                              alt={video.alt}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Video className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20"
                          >
                            <div className="rounded-full bg-white/90 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                              <Video className="h-6 w-6 text-primary" />
                            </div>
                          </a>
                        </div>
                      )}
                      {video.caption && (
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">{video.caption}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        ) : null}

        {/* Related Links */}
        {project.relatedLinks && project.relatedLinks.length > 0 && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">関連リンク</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.relatedLinks.map((link, index) => {
                  const getIcon = () => {
                    switch (link.type) {
                      case "documentation":
                        return <FileText className="h-5 w-5" />;
                      case "api":
                        return <Code className="h-5 w-5" />;
                      case "demo":
                        return <ExternalLink className="h-5 w-5" />;
                      case "video":
                        return <Video className="h-5 w-5" />;
                      default:
                        return <LinkIcon className="h-5 w-5" />;
                    }
                  };

                  const getTypeLabel = () => {
                    switch (link.type) {
                      case "documentation":
                        return "ドキュメント";
                      case "api":
                        return "API";
                      case "demo":
                        return "デモ";
                      case "video":
                        return "動画";
                      default:
                        return "リンク";
                    }
                  };

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto justify-start p-4"
                      asChild
                    >
                      <Link href={link.url} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-3">
                          {getIcon()}
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">{link.label}</span>
                            <span className="text-xs text-muted-foreground">{getTypeLabel()}</span>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Sub Projects */}
        {project.subProjects && project.subProjects.length > 0 && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">関連プロジェクト</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {project.subProjects.map((subProject) => (
                  <div
                    key={subProject.id}
                    className="group rounded-lg border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
                  >
                    <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                      {subProject.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                      {subProject.description}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {subProject.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {subProject.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{subProject.technologies.length - 4}
                        </Badge>
                      )}
                    </div>
                    {subProject.highlights && subProject.highlights.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {subProject.highlights.slice(0, 3).map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="mt-0.5 text-primary">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Project History/Timeline（直近5件表示・もっと見るでモーダルに全件） */}
        {projectHistory && projectHistory.length > 0 && (
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">開発の歴史</h2>
              <ProjectHistorySection events={projectHistory} />
            </section>
          </ScrollReveal>
        )}

        {/* Related Blog Posts */}
        <ScrollReveal>
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">関連ブログ記事</h2>
            {relatedPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  このプロジェクトに関連するブログ記事はまだありません。
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/blog">ブログ一覧を見る</Link>
                </Button>
              </div>
            )}
          </section>
        </ScrollReveal>
      </div>
    </>
  );
}

// プロジェクトの歴史を取得する関数（GitHub README の更新履歴を基に詳細化・新しい順）
// https://github.com/32Lwk/medicine-recommend-system
function getProjectHistory(projectId: string): Array<{
  date: string;
  title: string;
  description?: string;
  type?: string;
}> {
  if (projectId === "medicine-chat-tool") {
    return [
      {
        date: "2026年2月12日",
        title: "改善計画の実装",
        description: "「15歳以上以上」の重複表現修正、カロナールA・タイレノールAの効能データ修正、イブプロフェン200S/200SCの同一成分重複回避、HTMLタイポ検索手順のドキュメント化、医薬品名の半角統一機能を追加。",
        type: "改善・バグ修正",
      },
      {
        date: "2026年2月11日",
        title: "クラウド移行",
        description: "Render から GCP Cloud Run、Cloud SQL から Neon PostgreSQL へ移行。GitHub 連携による継続的デプロイ、Docker 化、約2日での移行完了。本番 URL は asia-northeast1（東京）で運用。",
        type: "インフラ",
      },
      {
        date: "2026年2月9日",
        title: "不適切入力ブロックとUI表示の改善",
        description: "絶対ブロック・セキュリティブロック時もセッションに案内メッセージを永続化し、status: ok で返すよう変更。不適切ワードの拡張（パパ活、ナンパ・出会い系等）、ブロック時は元入力を表示するよう修正。",
        type: "セキュリティ・UI",
      },
      {
        date: "2026年2月8日",
        title: "SRP改善計画の全Phase完了",
        description: "app.py を約89行にスリム化。ルートは main/admin/api/feedback に分離。rule_based_recommendation・medicine_logic・counseling_response・chat_handler をモジュール分割。妊娠・授乳時レッドフラッグの表示統一、エラー表示のユーザーフレンドリー化。",
        type: "リファクタリング",
      },
      {
        date: "2026年2月7日",
        title: "候補医薬品キー正規化・推奨テスト修正",
        description: "candidate_normalizer.py を新規作成し、スコアリング統合テスト失敗7件を解消。カロナール・タイレノール・ロキソニン系を生理痛専用医薬品の除外から例外として追加。",
        type: "アルゴリズム・テスト",
      },
      {
        date: "2026年1月16日",
        title: "オンボーディングUI・イースターエッグ・β版判定",
        description: "オンボーディングのスクロール・レスポンシブ強化、イースターエッグ説明スライド（多言語）、アプリケーション資料リンク、β版判定ロジック、バレンタイン・節分・冬シーズン対応UIを追加。",
        type: "UI/UX",
      },
      {
        date: "2026年1月14日",
        title: "シーズン対応UIの拡張",
        description: "2月14日はバレンタイン装飾、2月1日～3日は節分装飾、1月・2月の一般冬期間は冬装飾を表示。セッションごとに画像を固定。",
        type: "UI/UX",
      },
      {
        date: "2026年1月13日",
        title: "緊急避妊薬対応機能",
        description: "性被害を含む緊急避妊薬の質問に対応。72時間以内の服用の重要性、対面・オンライン診療の案内、心理的サポート・警察相談の案内。表記ゆれ（「避妊出来なかった」等）への対応。",
        type: "機能追加",
      },
      {
        date: "2026年1月3日",
        title: "スコアリングシステムの根本的改善",
        description: "主要解熱鎮痛薬のボーナス強化（カロナールA/タイレノールA 0.8、ロキソニンS 0.6等）、基本スコア底上げ、単一症状時の総合感冒薬ペナルティ強化（-0.7）、単一症状時の3医薬品推奨保証。",
        type: "アルゴリズム改善",
      },
      {
        date: "2026年1月2日",
        title: "単一症状スコアリング改善",
        description: "「たん」「痰」の同義語・誤検知防止（ブラックリスト）、効能特異性0.5底上げ・ペナルティ緩和、去痰成分ボーナス、浮動小数点比較・キャッシュ・エラーハンドリング強化。test_scoring_utils.py に12テスト追加。",
        type: "アルゴリズム改善",
      },
      {
        date: "2026年1月1日",
        title: "UI/UX大幅改善（アクセシビリティ）",
        description: "セクション折りたたみ、音声読み上げ、文字サイズ4段階、視覚的階層・WCAG AA、キーボード操作、UDフォント。高齢者向けアクセシビリティを強化。",
        type: "UI/UX",
      },
      {
        date: "2025年12月31日",
        title: "方言対応・謹賀新年アニメーション・各種機能強化",
        description: "方言辞書（100件以上）で標準語へ変換、謹賀新年縦書きアニメーション、緊急事案誤検知防止、成分重複チェック（30成分）、曖昧入力検出、総合感冒薬推奨強化、イースターエッグ13種類、薬剤師要請改善。",
        type: "機能拡張",
      },
      {
        date: "2025年12月30日",
        title: "眠気・不眠の区別・治療中キーワード検出",
        description: "眠気（drowsiness）と不眠（insomnia）を別フローに。眠気カウンセリング、カフェイン剤推奨改善、使用上の注意生成の症状連携。治療中キーワード検出と警告表示。",
        type: "機能追加",
      },
      {
        date: "2025年12月29日",
        title: "店舗案内拡張・緊急事案検出拡充",
        description: "商品検出（2,362件）、在庫確認キーワード拡張、緊急事案キーワード拡充（武器・窃盗等）。条件付きログ（エラー時・不適切評価時のみ会話履歴）。",
        type: "機能拡張",
      },
      {
        date: "2025年12月28日",
        title: "絶対評価ベースの僅差ロジック・構造化ログ",
        description: "raw_score をそのまま final_score に、表示スコアはランク調整・不足情報減点を適用。original_rank でランキング保護。構造化ログ（recommendation/counseling/error 等）を JSONL で出力。",
        type: "アルゴリズム・運用",
      },
      {
        date: "2025年12月27日",
        title: "診断名検出の大幅改善・イースターエッグ拡張",
        description: "診断名リスト約170項目、文脈考慮で既往歴除外。診断名のみ・診断名+症状・治療中・副作用の各パターン対応。絵文字パーティクル・画面変形（zoom/flip/bounce等）を拡張。",
        type: "機能・UI",
      },
      {
        date: "2025年12月26日",
        title: "イースターエッグ機能・ログ最適化",
        description: "感謝メッセージでパーティクル、画面変形（回転・傾き・揺れ）、スネークゲーム、絵文字パーティクル、花火・雪・雨アニメーション。医療用語チェックで誤発動防止。詳細ログを DEBUG レベルに変更。",
        type: "UI・運用",
      },
      {
        date: "2025年12月25日",
        title: "シーズン対応UI・不眠カウンセリング改善",
        description: "season_manager.py でクリスマス・正月・干支画像。雪アニメーションのスクロール対応・z-index 調整。不眠カウンセリングで2週間超・妊娠授乳時は受診勧告。",
        type: "UI・機能",
      },
      {
        date: "2025年12月24日",
        title: "不眠から薬推奨への切り替え・通知スタイル統一",
        description: "「教えて」「知りたい」等で薬推奨フローへ移行。Physical 切り替え時は Ask 検知をスキップ。通知メッセージのスタイル統一、妊娠可能性表示の改善。",
        type: "UX・UI",
      },
      {
        date: "2025年12月21日",
        title: "フォルダ構造整理・季節UI・管理者モバイル",
        description: "config/docs/data/log へ整理。冬装飾・雪アニメーション追加。管理者画面のモバイルレイアウト・横スライダー・モーダル詳細表示を改善。",
        type: "構成・UI",
      },
      {
        date: "2025年12月20日",
        title: "解熱鎮痛薬・外用薬スコアリング・管理者UI",
        description: "のど痛み+発熱時の解熱鎮痛薬・外用薬（のど）の優先度向上。管理者画面の manual-reply-queue 高さ調整、sendReply 名前衝突解消、エラーハンドリング強化。",
        type: "アルゴリズム・UI",
      },
      {
        date: "2025年12月19日",
        title: "二日酔い推奨アルゴリズム・のど+発熱時優先",
        description: "美容系L-システイン除外、五苓散優先、生薬配合胃腸薬ブースト。のど痛み+発熱時はのど特化風邪薬にボーナス。葛根湯の重症度ペナルティ追加。",
        type: "アルゴリズム改善",
      },
      {
        date: "2025年12月16日",
        title: "LLMトリアージ・カウンセリング・比喩的表現検出",
        description: "5カテゴリ（Physical/Emotional/Emergency/Ask/Other）への分類、confidence スコア。心臓緊急は文脈考慮・比喩的表現除外。カウンセリングは会話履歴活用・200文字、話題転換検知。危機キーワードの文脈考慮（「胸が苦しい」等除外）。",
        type: "機能追加",
      },
      {
        date: "2025年12月12日",
        title: "特殊用途医薬品フィルタ・プロジェクト整理",
        description: "ホルモン剤・性器専用医薬品の除外、スコア0.0除外・0.3以上フォールバック。症状マッチングの単語境界対応。不要ファイル・分析ドキュメントの削除。",
        type: "アルゴリズム・整理",
      },
      {
        date: "2025年12月11日",
        title: "DeepL移行・翻訳高速化・言語検出改善",
        description: "ChatGPT から DeepL API へ移行。翻訳 10～20 倍高速化、コスト約100倍削減。中国語と日本語の区別改善。翻訳キャッシュ・NLUキャッシュ・医薬品タイプキャッシュ追加。",
        type: "パフォーマンス",
      },
      {
        date: "2025年12月5日",
        title: "ChatGPTフォールバック廃止・部位特異的製品・質問生成",
        description: "ルールベース失敗時は詳細エラーメッセージのみ（フォールバック廃止）。部位特異的製品の検出・ペナルティ。ChatGPT による症状詳細質問生成（critical_questions）。NLU 信頼度計算の最適化。",
        type: "アルゴリズム・UX",
      },
      {
        date: "2025年12月4日",
        title: "管理者画面スコアモーダル拡張",
        description: "全スコア要素（ボーナス・ペナルティ含む）と計算過程の可視化。中間スコア・重み付け情報の表示。セクション色分け・プログレスバー。",
        type: "UI",
      },
      {
        date: "2025年12月3日",
        title: "管理者画面改善・構造化ログ",
        description: "ユーザー属性モーダル表示修正・デザイン更新。AI 自動応答 OFF 時のカスタムメッセージ設定。構造化ログ（recommendation/counseling/error 詳細）の実装。",
        type: "UI・運用",
      },
      {
        date: "2025年11月22日",
        title: "漢方薬推奨アルゴリズム強化",
        description: "若年層への中年向け漢方ペナルティ、当帰四逆加呉茱萸生姜湯の不適切推奨防止、釣藤散の年齢ペナルティ。kanpo_medicine.csv に34種類の漢方ルールを統合。証（Sho）解析・胃腸虚弱ユーザーへの安全装置。",
        type: "アルゴリズム改善",
      },
      {
        date: "2025年11月5日",
        title: "パフォーマンス最適化・マルチインスタンス・テスト",
        description: "二段階スコアリングで処理時間約70%削減。ChatGPT API 呼び出し統合（約67%削減）。PostgreSQL セッション・グローバル状態。セッション管理UI、監視ダッシュボード。単体・統合・デプロイテストスイート作成。",
        type: "パフォーマンス・インフラ",
      },
      {
        date: "2025年11月4日",
        title: "マルチインスタンス対応",
        description: "PostgreSQL ベースのセッション管理、グローバル状態の同期。Render Manual Scaling で 2～3 台・同時接続15台対応。DB 失敗時はメモリフォールバック。",
        type: "インフラ",
      },
      {
        date: "2025年11月2日",
        title: "ハイブリッド推奨システム更新",
        description: "ルールベース推奨の精度向上、AI フォールバック改善、インフルエンザ検出、症状特異性ペナルティ、リスク成分フィルタ。曖昧症状の質問生成、オンボーディング・FAQ 追加。",
        type: "アルゴリズム・UI",
      },
      {
        date: "2025年10月",
        title: "基盤構築とUI/UX改善（205コミット）",
        description: "多言語対応開始、症状検出・医薬品タイプ分類の拡充。ユーザー情報モーダル、オンボーディング、FAQ。管理者のフィードバック・セッション管理・詳細症状表示。症状検出ロジック・エラーハンドリング強化。",
        type: "基盤・UI",
      },
      {
        date: "2025年4月",
        title: "開発開始",
        description: "ドラッグストアでの現場経験を踏まえ、チャット型医薬品相談ツールの開発を開始。要件定義から設計・開発・運用まで一貫して担当。",
        type: "開発開始",
      },
    ];
  }
  return [];
}
