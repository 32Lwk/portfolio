import { getAllPostsForAdmin, getAllTagsForAdmin } from "@/lib/blog";
import { BlogForm } from "@/components/admin/BlogForm";

export default function AdminBlogNewPage() {
  const existingTags = getAllTagsForAdmin();
  const existingSlugs = getAllPostsForAdmin().map((p) => p.slug);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">新規作成</h2>
      <BlogForm existingTags={existingTags} existingSlugs={existingSlugs} />
    </div>
  );
}
