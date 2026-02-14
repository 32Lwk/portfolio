import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">ダッシュボード</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">ブログ</h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/admin/blog">ブログ一覧</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/blog/new">新規作成</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/tags">タグ管理</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">プロジェクト</h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/admin/projects">プロジェクト一覧</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/projects/new">新規作成</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
