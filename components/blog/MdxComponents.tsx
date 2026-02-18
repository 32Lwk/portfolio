"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-4 mt-8 text-3xl font-bold" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-3 mt-6 text-2xl font-bold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 mt-4 text-xl font-semibold" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="mb-2 mt-4 text-lg font-semibold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-7 break-words" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = props.href?.startsWith("http");
    return (
      <a
        {...props}
        className="text-primary hover:underline break-all"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {props.children}
        {isExternal && (
          <ExternalLink className="ml-1 inline h-3 w-3" />
        )}
      </a>
    );
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 ml-6 list-disc" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 ml-6 list-decimal" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="mb-2" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-4 border-l-4 border-primary bg-muted pl-4 italic"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode }) => {
    // classNameがない場合はインラインコード
    const isInline = !props.className;
    const className = props.className || "";
    const match = /language-(\w+)/.exec(className);
    const language = match ? match[1] : "";
    
    // インラインコードまたは言語指定がない場合は通常のcodeタグ
    if (isInline || !language) {
      return (
        <code
          className="rounded bg-muted px-1 py-0.5 text-sm break-all"
          {...props}
        />
      );
    }

    // コードブロックの場合、childrenからコード文字列を取得
    let codeString = "";
    const children = props.children;
    
    if (typeof children === "string") {
      codeString = children;
    } else if (Array.isArray(children)) {
      codeString = children.map((c: any) => 
        typeof c === "string" ? c : (c?.props?.children || String(c))
      ).join("");
    } else if (children && typeof children === "object") {
      codeString = String((children as any)?.props?.children || children);
    } else {
      codeString = String(children || "");
    }
    
    codeString = codeString.replace(/\n$/, "");

    return <CodeBlock code={codeString} language={language} />;
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) => (
    <pre {...props} className={`max-w-full overflow-x-auto ${props.className ?? ""}`.trim()} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!props.src || typeof props.src !== "string") return null;
    const width = props.width;
    const isFullWidth = typeof width === "string" && width.endsWith("%");
    const isExternal = props.src.startsWith("http://") || props.src.startsWith("https://");
    
    if (isFullWidth || isExternal) {
      return (
        <span className="my-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.src}
            alt={props.alt ?? "記事内の画像"}
            className="rounded-lg w-full max-w-full"
            style={{ width: "100%", height: "auto" }}
            loading="lazy"
          />
        </span>
      );
    }
    const numWidth = Number(width) || 800;
    const numHeight = Number(props.height) || 600;
    return (
      <span className="my-4 flex justify-center">
        <Image
          src={props.src}
          alt={props.alt ?? "記事内の画像"}
          width={numWidth}
          height={numHeight}
          className="rounded-lg"
          quality={85}
        />
      </span>
    );
  },
  figure: (props: React.HTMLAttributes<HTMLElement>) => (
    <figure {...props} className="my-4 flex flex-col items-center" />
  ),
  figcaption: (props: React.HTMLAttributes<HTMLElement>) => (
    <figcaption
      className="mt-2 text-center text-sm text-muted-foreground"
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-border" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse border" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border bg-muted p-2 text-left font-semibold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border p-2" {...props} />
  ),
};
