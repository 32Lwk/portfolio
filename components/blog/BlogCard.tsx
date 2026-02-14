"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { BlogPost } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:shadow-lg"
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary">{post.category}</Badge>
          <time className="text-sm text-muted-foreground">
            {format(new Date(post.date), "yyyy年MM月dd日", { locale: ja })}
          </time>
        </div>
        <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {post.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - 3}
            </Badge>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
