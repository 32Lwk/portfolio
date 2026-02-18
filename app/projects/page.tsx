import { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { ProjectGrid } from "@/components/portfolio/ProjectGrid";
import { StructuredData } from "@/components/seo/StructuredData";
import { CodeVisualizationDynamic } from "@/components/animations/CodeVisualizationDynamic";
import { getSiteUrl } from "@/lib/site-url";
import { getDefaultOgImage } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Projects",
  description: "チャット型医薬品相談ツールをはじめとする、医療×AI分野での個人開発プロジェクト一覧。",
  openGraph: {
    url: `${siteUrl}/projects`,
    title: "Projects | 川嶋 宥翔",
    description: "チャット型医薬品相談ツールをはじめとする、医療×AI分野での個人開発プロジェクト一覧。",
    type: "website",
    images: [getDefaultOgImage("川嶋 宥翔 | Projects")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | 川嶋 宥翔",
    description: "チャット型医薬品相談ツールをはじめとする、医療×AI分野での個人開発プロジェクト一覧。",
    images: ["/og_image.png"],
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <>
      <CodeVisualizationDynamic />
      {projects.map((project) => (
        <StructuredData key={project.id} type="Project" data={project} />
      ))}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            医療×AI分野での個人開発プロジェクト一覧
          </p>
        </div>
        <ProjectGrid projects={projects} />
      </div>
    </>
  );
}
