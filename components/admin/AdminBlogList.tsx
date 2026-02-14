"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type BlogListSort =
  | "dateDesc"
  | "dateAsc"
  | "titleAsc"
  | "titleDesc"
  | "categoryAsc";

export function AdminBlogList({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<BlogListSort>("dateDesc");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string; title: string } | null>(null);

  const executeDelete = async (slug: string) => {
    setDeleting(slug);
    try {
      const res = await fetch("/api/admin/delete-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        alert("削除に失敗しました");
      }
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const openDeleteModal = (post: BlogPost) => setDeleteTarget({ slug: post.slug, title: post.title });
  const closeDeleteModal = () => {
    if (!deleting) setDeleteTarget(null);
  };

  const filteredAndSorted = useMemo(() => {
    let list = posts;
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case "dateDesc":
        sorted.sort((a, b) => (a.date < b.date ? 1 : -1));
        break;
      case "dateAsc":
        sorted.sort((a, b) => (a.date < b.date ? -1 : 1));
        break;
      case "titleAsc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleDesc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "categoryAsc":
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }
    return sorted;
  }, [posts, categoryFilter, search, sortBy]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground mb-4">記事がありません</p>
        <Button asChild>
          <Link href="/admin/blog/new">新規作成</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {BLOG_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as BlogListSort)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateDesc">日付（新しい順）</SelectItem>
            <SelectItem value="dateAsc">日付（古い順）</SelectItem>
            <SelectItem value="titleAsc">タイトル（あいうえお）</SelectItem>
            <SelectItem value="titleDesc">タイトル（逆順）</SelectItem>
            <SelectItem value="categoryAsc">カテゴリ</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="タイトルで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button asChild>
          <Link href="/admin/blog/new">新規作成</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  該当する記事がありません
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <span className="flex gap-1">
                      {post.featured && <Badge variant="secondary">注目</Badge>}
                      {post.draft && <Badge variant="outline">下書き</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/blog/${post.slug}/edit`}>編集</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteModal(post)}
                        disabled={deleting === post.slug}
                      >
                        {deleting === post.slug ? "削除中..." : "削除"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && closeDeleteModal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ブログを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  「{deleteTarget.title}」を削除します。この操作は取り消せません。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deleting}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) executeDelete(deleteTarget.slug);
              }}
            >
              {deleteTarget && deleting === deleteTarget.slug ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
