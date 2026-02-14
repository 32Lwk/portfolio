import { getAllPostsForAdmin } from "@/lib/blog";
import { AdminBlogList } from "@/components/admin/AdminBlogList";

export default function AdminBlogListPage() {
  const posts = getAllPostsForAdmin();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">ブログ一覧</h2>
      <AdminBlogList posts={posts} />
    </div>
  );
}
