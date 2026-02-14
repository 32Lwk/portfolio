import { getTagsWithCount } from "@/lib/blog";
import { AdminTagList } from "@/components/admin/AdminTagList";

export default function AdminTagsPage() {
  const tagsWithCount = getTagsWithCount();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">タグ管理</h2>
      <p className="text-muted-foreground text-sm">
        タグの名前変更や、全記事からタグを削除できます。タグの追加は各ブログ記事の編集画面で行います。
      </p>
      <AdminTagList tagsWithCount={tagsWithCount} />
    </div>
  );
}
