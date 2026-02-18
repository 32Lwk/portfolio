import { BlogPost } from "@/lib/blog";
import { Project } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site-url";

interface StructuredDataProps {
  type: "Person" | "Article" | "WebSite" | "Project";
  data?: BlogPost | Project;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = getSiteUrl();

  let structuredData: any = {
    "@context": "https://schema.org",
    "@type": type,
  };

  if (type === "Person") {
    structuredData = {
      ...structuredData,
      name: "川嶋 宥翔",
      alternateName: "Kawashima Yuto",
      jobTitle: "フルスタックエンジニア",
      url: baseUrl,
      sameAs: [
        "https://github.com/32Lwk",
        "https://www.linkedin.com/in/kawashimayuto/",
        "https://www.instagram.com/32_lwk",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "名古屋大学",
      },
    };
  } else if (type === "Article" && data && "title" in data) {
    const post = data as BlogPost;
    structuredData = {
      ...structuredData,
      headline: post.title,
      description: post.description,
      author: {
        "@type": "Person",
        name: "川嶋 宥翔",
      },
      datePublished: post.date,
      dateModified: post.date,
      url: `${baseUrl}/blog/${post.slug}`,
    };
  } else if (type === "WebSite") {
    structuredData = {
      ...structuredData,
      name: "川嶋 宥翔 | Portfolio & Blog",
      url: baseUrl,
      description:
        "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
    };
  } else if (type === "Project" && data && "id" in data) {
    const project = data as Project;
    structuredData = {
      ...structuredData,
      name: project.name,
      description: project.description,
      url: project.demoUrl || project.githubUrl || baseUrl,
      applicationCategory: project.category,
      programmingLanguage: project.technologies,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
