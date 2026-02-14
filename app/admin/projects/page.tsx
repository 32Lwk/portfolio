import Link from "next/link";
import { getProjectsFromFile } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminProjectsPage() {
  const projects = getProjectsFromFile();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">プロジェクト一覧</h2>
        <Button asChild>
          <Link href="/admin/projects/new">新規追加</Link>
        </Button>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          プロジェクトがありません。「新規追加」から追加してください。
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>サブ</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.id}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>
                    {p.subProjects?.length ? (
                      <Badge variant="secondary">{p.subProjects.length} 件</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/projects/${p.id}/edit`}>編集</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
