"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/lib/blog";

interface BlogNavigationProps {
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
}

export function BlogNavigation({ prevPost, nextPost }: BlogNavigationProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
      {prevPost ? (
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href={`/blog/${prevPost.slug}`}>
            <ChevronLeft className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{prevPost.title}</span>
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {nextPost && (
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href={`/blog/${nextPost.slug}`}>
            <span className="truncate">{nextPost.title}</span>
            <ChevronRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </Button>
      )}
    </nav>
  );
}
