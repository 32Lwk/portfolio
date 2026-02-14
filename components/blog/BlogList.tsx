"use client";

import type { BlogPost } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";
import { BlogCard } from "./BlogCard";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSearch, ChevronDown, ChevronUp } from "lucide-react";

type SortOption = "dateDesc" | "dateAsc" | "titleAsc" | "titleDesc";

interface BlogListProps {
  posts: BlogPost[];
}

const TAG_LINE_HEIGHT = 32;
const TAG_COLLAPSED_LINES = 2;

export function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("dateDesc");
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const categories = BLOG_CATEGORIES;
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();

  const filteredPosts = useMemo(() => {
    const list = posts.filter((post) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDescription = (post.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDescription) return false;
      }
      if (selectedCategory && post.category !== selectedCategory) return false;
      if (selectedTag && !post.tags.includes(selectedTag)) return false;
      return true;
    });
    const sorted = [...list];
    switch (sortBy) {
      case "dateDesc":
        sorted.sort((a, b) => (b.date > a.date ? 1 : -1));
        break;
      case "dateAsc":
        sorted.sort((a, b) => (a.date > b.date ? 1 : -1));
        break;
      case "titleAsc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleDesc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    return sorted;
  }, [posts, searchQuery, selectedCategory, selectedTag, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== null ||
    selectedTag !== null ||
    sortBy !== "dateDesc";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setSortBy("dateDesc");
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div>
          <h3 className="mb-1.5 text-sm font-semibold">検索</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="search"
              placeholder="タイトル・説明で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                フィルタをクリア
              </Button>
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-semibold">カテゴリ</h3>
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
          <h3 className="mb-1.5 text-sm font-semibold">ソート</h3>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateDesc">日付 新しい順</SelectItem>
              <SelectItem value="dateAsc">日付 古い順</SelectItem>
              <SelectItem value="titleAsc">タイトル 昇順</SelectItem>
              <SelectItem value="titleDesc">タイトル 降順</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-semibold">タグ</h3>
          <div
            className="overflow-hidden transition-[max-height] duration-300"
            style={{
              maxHeight: tagsExpanded ? "500px" : `${TAG_LINE_HEIGHT * TAG_COLLAPSED_LINES}px`,
            }}
          >
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                className="h-8 shrink-0"
                onClick={() => setSelectedTag(null)}
              >
                すべて
              </Button>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="h-8 cursor-pointer shrink-0 items-center px-2.5"
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? null : tag)
                  }
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {tags.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1.5 h-8 gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => setTagsExpanded(!tagsExpanded)}
            >
              {tagsExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  閉じる
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  もっと見る
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileSearch className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {posts.length === 0
              ? "記事がまだありません。"
              : "該当する記事が見つかりませんでした。"}
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
