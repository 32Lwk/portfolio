import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">ページが見つかりません</h2>
        <p className="mt-4 text-muted-foreground">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
