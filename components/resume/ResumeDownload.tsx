"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ResumeDownload() {
  return (
    <Button variant="outline" asChild>
      <a href="/resume/resume.pdf" download>
        <Download className="mr-2 h-4 w-4" />
        PDFをダウンロード
      </a>
    </Button>
  );
}
