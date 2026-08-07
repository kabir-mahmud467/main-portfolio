import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConfig } from "../src/config/db.config.js";
import { Post } from "../src/modules/blog/blog.model.js";
import { slugify } from "../src/core/utils/slugify.js";
import { calculateReadingTime } from "../src/core/utils/readingTime.js";
import { CLOUD_TOPIC_SETS_A } from "./seed-cloud-topics-1.js";
import { CLOUD_TOPIC_SETS_B } from "./seed-cloud-topics-2.js";
import { CLOUD_TOPIC_SETS_C } from "./seed-cloud-topics-3.js";
import { CLOUD_TOPIC_SETS_D } from "./seed-cloud-topics-4.js";

dotenv.config();

const ALL_TOPICS = [
  ...CLOUD_TOPIC_SETS_A,
  ...CLOUD_TOPIC_SETS_B,
  ...CLOUD_TOPIC_SETS_C,
  ...CLOUD_TOPIC_SETS_D,
];
const PICSUM = (seed, w = 1200, h = 675) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

let seedState = 1337;
function seededRandom() {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
}
function randInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function rotate(arr, offset) {
  return arr.map((_, i) => arr[(i + offset) % arr.length]);
}

const mdTable = ({ title, headers, rows, note }) => {
  const sep = `|${headers.map(() => "---").join("|")}|`;
  const head = `|${headers.join("|")}|`;
  const body = rows.map((r) => `|${r.join("|")}|`).join("\n");
  return `### ${title}\n\n${head}\n${sep}\n${body}\n\n*${note}*`;
};

const mdImage = (slug, n, alt, caption) =>
  `![${alt}](${PICSUM(`${slug}-${n}`)})\n\n*${caption}*`;

const mdList = (items) => items.map((i) => `- ${i}`).join("\n");

const stripMd = (md) =>
  md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`>|]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const excerptFrom = (content, len = 170) => {
  const first = content.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("!")).slice(0, 3).join(" ");
  return stripMd(first).slice(0, len).replace(/\s\S*$/, "") + "...";
};

const HOOKS = [
  (title) => `This is the article I wish I had read before I learned ${title.toLowerCase()} the hard way — through production incidents, surprise bills, and late-night restores. Every paragraph comes from operating real applications, not from a marketing page.`,
  (title) => `If you have ever searched for ${title.toLowerCase()} and found either marketing fluff or theory without consequences, this guide is for you. It is the practical version: what to configure, what to watch, and what actually breaks.`,
  (title) => `There is a quiet gap between how documentation presents ${title.toLowerCase()} and how it behaves under real traffic. This article exists to close that gap, with patterns drawn from deployments that have survived production, spikes, and the occasional incident.`,
];

function buildPost(topic, postIdx, globalIdx) {
  const title = topic.titles[postIdx % topic.titles.length];
  const slug = slugify(title);
  const rot = postIdx % 3;
  const hook = HOOKS[rot](title);
  const intro = rotate(topic.intro, rot);
  const conclusion = rotate(topic.conclusion, rot);
  const images = [
    mdImage(slug, 1, `${topic.category} concept`, "The model in practice: the pieces fit together before the first line of application code."),
    mdImage(slug, 2, `${topic.category} workflow`, "The workflow applied: configuration and discipline, not heroics."),
    mdImage(slug, 3, `${topic.category} results`, "The payoff: infrastructure that runs quietly so the product gets the attention."),
  ];

  const parts = [
    `> ${hook}`,
    "",
    "## Introduction",
    "",
    intro.join("\n\n"),
    "",
    images[0],
    "",
    "## Why It Matters",
    "",
    topic.why.join("\n\n"),
    "",
    mdList(topic.whyBullets),
    "",
    "## The Problem",
    "",
    topic.problem.join("\n\n"),
    "",
    "## The Approach",
    "",
    topic.approach.join("\n\n"),
    "",
    topic.codeLead,
    "",
    topic.code,
    "",
    images[1],
    "",
    mdTable(topic.comparison),
    "",
    "## Implementation",
    "",
    topic.implementation.join("\n\n"),
    "",
    mdList(topic.implBullets),
    "",
    "## Key Decisions",
    "",
    topic.decisions.map((d) => `### ${d.heading}\n\n${d.text}`).join("\n\n"),
    "",
    "## Common Mistakes to Avoid",
    "",
    topic.mistakes.join("\n\n"),
    "",
    mdList(topic.mistakesBullets),
    "",
    images[2],
    "",
    "## Putting It Into Practice",
    "",
    topic.practice.join("\n\n"),
    "",
    "## Key Takeaways",
    "",
    mdList(topic.takeaways),
    "",
    "## Frequently Asked Questions",
    "",
    topic.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n"),
    "",
    "## Conclusion",
    "",
    conclusion.join("\n\n"),
    "",
  ];

  const content = parts.filter((p) => p !== "").join("\n\n");
  const excerpt = excerptFrom(content);

  return {
    title,
    slug,
    excerpt,
    content,
    contentFormat: "markdown",
    coverImage: PICSUM(slug, 1200, 675),
    status: "published",
    featured: globalIdx % 8 === 0,
    categories: [topic.category],
    tags: topic.tags,
    seo: {
      title,
      description: stripMd(topic.faqs[0].a).slice(0, 155),
      ogImage: PICSUM(slug, 1200, 675),
      canonicalUrl: `/blog/${slug}`,
      noIndex: false,
    },
    readingTime: calculateReadingTime(content),
    views: randInt(140, 5200),
    publishedAt: new Date(Date.now() - (globalIdx + 1) * 26 * 3600e3),
  };
}

async function main() {
  await mongoose.connect(dbConfig.uri);
  console.log("Connected to MongoDB. Seeding cloud/hosting/Firebase posts...");

  const existing = await Post.find({}, { slug: 1 }).lean();
  const existingSlugs = new Set(existing.map((p) => p.slug));
  console.log(`Found ${existing.length} existing posts.`);

  const posts = [];
  const skipped = [];
  let global = existing.length;
  ALL_TOPICS.forEach((topic, tIdx) => {
    for (let p = 0; p < 5; p++) {
      const post = buildPost(topic, p + tIdx * 3, global++);
      if (existingSlugs.has(post.slug)) {
        skipped.push(post.slug);
        continue;
      }
      posts.push(post);
    }
  });

  console.log(`Building ${posts.length} new posts, skipping ${skipped.length} existing slugs.`);
  if (skipped.length) console.log("Skipped:", skipped.join(", "));

  if (!posts.length) {
    console.log("Nothing to insert.");
    await mongoose.disconnect();
    return;
  }

  const res = await Post.insertMany(posts, { ordered: false });
  console.log(`Inserted ${res.length} posts.`);
  const byCategory = {};
  posts.forEach((p) => {
    byCategory[p.categories[0]] = (byCategory[p.categories[0]] || 0) + 1;
  });
  console.log("By category:", byCategory);
  await mongoose.disconnect();
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMain) {
  main().catch(async (err) => {
    console.error("Seeding failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  });
}
