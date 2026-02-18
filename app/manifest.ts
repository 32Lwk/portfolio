import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = getSiteUrl();
  return {
    name: "川嶋 宥翔 | Portfolio & Blog",
    short_name: "Yuto K.",
    description:
      "名古屋大学 理学部物理学科に在籍する大学生。ポートフォリオとブログ。",
    start_url: baseUrl + "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
