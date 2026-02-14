import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectsFromFile } from "@/lib/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectEditPage({ params }: Props) {
  const { id } = await params;
  const projects = getProjectsFromFile();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">編集: {project.name}</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/projects">一覧へ</Link>
        </Button>
      </div>
      <ProjectForm initial={project} />
    </div>
  );
}
