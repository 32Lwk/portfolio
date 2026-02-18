import { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteConfig = {
  name: "川嶋 宥翔 | Portfolio & Blog",
  description:
    "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
  get url() {
    return getSiteUrl();
  },
  ogImage: "/og_image.png",
  links: {
    github: "https://github.com/32Lwk",
    linkedin: "https://www.linkedin.com/in/kawashimayuto/",
  },
};

export function generateMetadata({
  title,
  description,
  image,
  type = "website",
}: {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const metaTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      locale: "ja_JP",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
  };
}

export function generateStructuredData({
  type,
  ...data
}: {
  type: "Person" | "Article" | "WebSite";
  [key: string]: any;
}) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type,
  };

  if (type === "Person") {
    return {
      ...baseStructuredData,
      name: "川嶋 宥翔",
      jobTitle: "フルスタックエンジニア",
      url: siteConfig.url,
      sameAs: [
        siteConfig.links.github,
        siteConfig.links.linkedin,
      ],
    };
  }

  if (type === "Article") {
    return {
      ...baseStructuredData,
      headline: data.headline,
      description: data.description,
      author: {
        "@type": "Person",
        name: "川嶋 宥翔",
      },
      datePublished: data.datePublished,
      dateModified: data.dateModified || data.datePublished,
    };
  }

  return baseStructuredData;
}

/** 一覧ページなどで使うデフォルト OGP 画像（共通化用） */
export function getDefaultOgImage(alt?: string) {
  return {
    url: siteConfig.ogImage,
    width: 1200,
    height: 630,
    alt: alt ?? siteConfig.name,
  };
}
