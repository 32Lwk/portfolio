import { Metadata } from "next";
import { getResumeData } from "@/lib/resume";
import { ResumeSection } from "@/components/resume/ResumeSection";
import { ResumeDownload } from "@/components/resume/ResumeDownload";
import { getSiteUrl } from "@/lib/site-url";
import { getDefaultOgImage } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Resume",
  description: "川嶋宥翔の経歴書（Resume）",
  openGraph: {
    url: `${siteUrl}/resume`,
    title: "Resume | 川嶋 宥翔",
    description: "川嶋宥翔の経歴書（Resume）",
    type: "website",
    images: [getDefaultOgImage("川嶋 宥翔 | Resume")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | 川嶋 宥翔",
    description: "川嶋宥翔の経歴書（Resume）",
    images: ["/og_image.png"],
  },
};

export default function ResumePage() {
  const resumeData = getResumeData();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 print:max-w-full print:px-0">
      <div className="mb-8 flex items-center justify-between no-print">
        <div>
          <h1 className="text-4xl font-bold">Resume</h1>
          <p className="mt-2 text-muted-foreground">川嶋宥翔の経歴書</p>
        </div>
        <ResumeDownload />
      </div>
      <ResumeSection data={resumeData} />
    </div>
  );
}
