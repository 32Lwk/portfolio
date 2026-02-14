import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Button } from "@/components/ui/button";

export default function AdminProjectNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">プロジェクトを追加</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/projects">一覧へ</Link>
        </Button>
      </div>
      <ProjectForm initial={null} />
    </div>
  );
}
