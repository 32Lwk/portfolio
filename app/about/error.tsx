"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AboutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-4xl font-bold">エラーが発生しました</h1>
        <p className="mt-4 text-muted-foreground">
          予期しないエラーが発生しました。しばらくしてから再度お試しください。
        </p>
        {error.digest && (
          <p className="mt-2 text-sm text-muted-foreground">
            エラーID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button onClick={reset}>再試行</Button>
          <Button variant="outline" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="outline" asChild>
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
