import fs from "fs";
import path from "path";
import { getAllPosts } from "../lib/blog";
import { generateSummary, generateMetadataFromContent } from "../lib/ai";

const cacheDir = path.join(process.cwd(), ".cache");
const metadataCacheFile = path.join(cacheDir, "metadata-cache.json");

interface MetadataCache {
  [slug: string]: {
    summary?: string;
    description?: string;
    keywords?: string[];
    lastGenerated: string;
  };
}

function loadCache(): MetadataCache {
  if (fs.existsSync(metadataCacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(metadataCacheFile, "utf-8"));
    } catch (error) {
      console.error("Error loading cache:", error);
      return {};
    }
  }
  return {};
}

function saveCache(cache: MetadataCache) {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(metadataCacheFile, JSON.stringify(cache, null, 2));
}

async function main() {
  console.log("Starting metadata generation...");

  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set. Skipping AI metadata generation.");
    return;
  }

  const posts = getAllPosts();
  const cache = loadCache();

  for (const post of posts) {
    const cached = cache[post.slug];
    const postPath = path.join(
      process.cwd(),
      "content/blog",
      `${post.slug}.md`
    );

    // キャッシュがある場合、ファイルの更新日時をチェック
    if (cached && fs.existsSync(postPath)) {
      const stats = fs.statSync(postPath);
      const fileModified = stats.mtime.toISOString();
      if (cached.lastGenerated >= fileModified) {
        console.log(`Skipping ${post.slug} (cached)`);
        continue;
      }
    }

    console.log(`Generating metadata for ${post.slug}...`);

    try {
      const summary = await generateSummary(post.content);
      const metadata = await generateMetadataFromContent(post.content);

      cache[post.slug] = {
        summary,
        description: metadata.description,
        keywords: metadata.keywords,
        lastGenerated: new Date().toISOString(),
      };

      // 少し待機してAPIレート制限を避ける
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${post.slug}:`, error);
    }
  }

  saveCache(cache);
  console.log("Metadata generation complete!");
}

main().catch(console.error);
