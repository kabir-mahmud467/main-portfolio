import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConfig } from "../src/config/db.config.js";
import { Post } from "../src/modules/blog/blog.model.js";
import { TOPIC_SETS_A } from "./seed-content-posts-1.js";
import { TOPIC_SETS_B } from "./seed-content-posts-2.js";
import { TOPIC_SETS_C } from "./seed-content-posts-3.js";
import { buildPost } from "./seed-demo.js";

dotenv.config();

const ALL_TOPICS = [...TOPIC_SETS_A, ...TOPIC_SETS_B, ...TOPIC_SETS_C];

function buildSeedSlugs() {
  const slugs = new Set();
  let global = 0;
  ALL_TOPICS.forEach((topic, tIdx) => {
    for (let p = 0; p < 5; p++) {
      slugs.add(buildPost(topic, p + tIdx * 3, global++).slug);
    }
  });
  return slugs;
}

async function main() {
  await mongoose.connect(dbConfig.uri);
  const seedSlugs = buildSeedSlugs();
  console.log(`Seed set covers ${seedSlugs.size} slugs.`);

  const posts = await Post.find().select("slug status").lean();
  const orphans = posts.filter((p) => !seedSlugs.has(p.slug));
  console.log(`Total posts in DB: ${posts.length}`);
  console.log(`Orphan posts (not produced by the current seed): ${orphans.length}`);

  if (orphans.length === 0) {
    console.log("Nothing to prune.");
    await mongoose.disconnect();
    return;
  }

  const dryRun = !process.argv.includes("--apply");
  if (dryRun) {
    orphans.forEach((o) => console.log(`  would remove: ${o.slug} [${o.status}]`));
    console.log("Dry run — re-run with --apply to delete these posts.");
  } else {
    const res = await Post.deleteMany({ _id: { $in: orphans.map((o) => o._id) } });
    console.log(`Deleted ${res.deletedCount} orphan posts.`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Prune failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
