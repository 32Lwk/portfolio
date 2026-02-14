"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TagWithCount = { tag: string; count: number };

export function AdminTagList({ tagsWithCount }: { tagsWithCount: TagWithCount[] }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleRename = async (oldTag: string) => {
    const name = newName.trim();
    if (!name || name === oldTag) {
      setRenaming(null);
      setNewName("");
      return;
    }
    setRenaming(oldTag);
    try {
      const res = await fetch("/api/admin/tags/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldTag, newTag: name }),
      });
      if (res.ok) router.refresh();
      else alert("名前の変更に失敗しました");
    } catch {
      alert("名前の変更に失敗しました");
    } finally {
      setRenaming(null);
      setNewName("");
    }
  };

  const handleDelete = async (tag: string) => {
    if (!window.confirm(`タグ「${tag}」を全記事から削除しますか？`)) return;
    setDeleting(tag);
    try {
      const res = await fetch("/api/admin/tags/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      if (res.ok) router.refresh();
      else alert("削除に失敗しました");
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  if (tagsWithCount.length === 0) {
    return (
      <p className="text-muted-foreground">タグはまだありません。ブログ記事でタグを追加するとここに表示されます。</p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タグ名</TableHead>
            <TableHead>記事数</TableHead>
            <TableHead className="w-[280px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tagsWithCount.map(({ tag, count }) => (
            <TableRow key={tag}>
              <TableCell className="font-medium">{tag}</TableCell>
              <TableCell>{count}</TableCell>
              <TableCell>
                {renaming === tag ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="新しい名前"
                      className="h-8 w-36"
                    />
                    <Button size="sm" onClick={() => handleRename(tag)}>
                      反映
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRenaming(null);
                        setNewName("");
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRenaming(tag);
                        setNewName(tag);
                      }}
                    >
                      名前変更
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tag)}
                      disabled={deleting === tag}
                    >
                      {deleting === tag ? "削除中..." : "全記事から削除"}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
