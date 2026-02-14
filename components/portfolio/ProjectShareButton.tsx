"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link2 } from "lucide-react";

interface ProjectShareButtonProps {
  url: string;
}

export function ProjectShareButton({ url }: ProjectShareButtonProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("リンクをクリップボードにコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 whitespace-nowrap min-w-[100px]"
      onClick={copyToClipboard}
    >
      <Link2 className="h-4 w-4 mr-2 shrink-0" />
      URLをコピー
    </Button>
  );
}
