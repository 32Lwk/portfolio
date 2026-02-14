"use client";

import { Twitter, Facebook, Linkedin, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("リンクをクリップボードにコピーしました");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" asChild>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitterでシェア"
        >
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebookでシェア"
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedInでシェア"
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copyToClipboard}>
        <Link2 className="mr-2 h-4 w-4" />
        リンクをコピー
      </Button>
    </div>
  );
}
