"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // テーマの検出
    const checkTheme = () => {
      if (typeof window !== "undefined") {
        const html = document.documentElement;
        const isDarkMode = html.classList.contains("dark");
        setIsDark(isDarkMode);
      }
    };

    checkTheme();

    // テーマ変更の監視
    const observer = new MutationObserver(checkTheme);
    if (typeof window !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className="code-block-scroll group relative mb-4 min-w-0 w-full max-w-full overflow-x-scroll overflow-y-hidden rounded-lg"
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
          background: isDark ? "#1e1e1e" : "#f5f5f5",
          minWidth: "min-content",
        }}
        PreTag="div"
        codeTagProps={{
          style: { whiteSpace: "pre" },
        }}
      >
        {code}
      </SyntaxHighlighter>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        onClick={handleCopy}
        title="コードをコピー"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
