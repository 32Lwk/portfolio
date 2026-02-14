"use client";

import type { BlogPost } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";
import { BlogCard } from "./BlogCard";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = BLOG_CATEGORIES;
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory && post.category !== selectedCategory) return false;
    if (selectedTag && !post.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold">カテゴリ</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              すべて
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">タグ</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              すべて
            </Button>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedTag(selectedTag === tag ? null : tag)
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            該当する記事が見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
