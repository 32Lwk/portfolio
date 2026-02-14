import { notFound } from "next/navigation";
import Link from "next/link";
import { isAdminEnabled } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminEnabled()) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 border-b pb-4">
        <h1 className="mb-4 text-2xl font-bold">管理画面</h1>
        <nav className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">ダッシュボード</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog">ブログ一覧</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/projects">プロジェクト一覧</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/tags">タグ管理</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/about">About編集</Link>
          </Button>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
