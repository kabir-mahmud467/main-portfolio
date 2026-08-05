import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConfig } from "../src/config/db.config.js";
import { Post } from "../src/modules/blog/blog.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import { slugify } from "../src/core/utils/slugify.js";
import { calculateReadingTime } from "../src/core/utils/readingTime.js";
import { TOPIC_SETS_A } from "./seed-content-posts-1.js";
import { TOPIC_SETS_B } from "./seed-content-posts-2.js";
import { PROJECT_TYPES } from "./seed-content-projects.js";
import { EXTRA_BLOCKS } from "./seed-content-extra.js";

dotenv.config();

const WIPE = process.argv.includes("--wipe");
const ALL_TOPICS = [...TOPIC_SETS_A, ...TOPIC_SETS_B];
const PICSUM = (seed, w = 1200, h = 675) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

let seedState = 42;
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
  (title) => `This is the article I wish I had read before I rebuilt ${title.toLowerCase().replace(/\s+/g, " ")} for the third time. Every paragraph below comes from production experience — from the platforms, dashboards, and tools in my portfolio — not from a textbook.`,
  (title) => `If you have ever started a project like ${title} and watched it grow from a clean folder structure into an unruly pile of exceptions, this guide is for you. It is the distilled version of the lessons that took years of production work to learn.`,
  (title) => `There is a quiet gap between how tutorials teach ${title.toLowerCase().replace(/\s+/g, " ")} and how production systems actually behave. This article exists to close that gap, with patterns drawn from real deployments, real incidents, and real refactors.`,
];

const CASE_STUDIES = [
  (title, topic) => {
    const proj = pickProjectFor(topic.category);
    return `The principles in this article were applied end to end when I rebuilt ${proj} from a prototype into a production service. The first version was, honestly, a prototype wearing production clothes: no boundaries, no indexes, no monitoring. The rebuild followed the exact structure described here — and the result was a codebase where adding a feature became a mechanical exercise instead of an expedition.\n\nThe measurable difference came from the boring parts. The deployment pipeline that ships ${proj} is the same one that ships this platform, and the incident rate dropped to zero for the first year after the rebuild.`;
  },
  (title, topic) => {
    const proj = pickProjectFor(topic.category);
    return `When ${proj} hit its first real traffic spike, the architecture described in this article was the difference between an incident and a non-event. The queries were indexed, the reads were cached, and the pages were server-rendered — so the spike showed up as a flat line on the database charts and nothing more.\n\nWhat made it possible was not a clever library. It was the discipline of applying these patterns consistently from day one: every module shaped the same way, every decision written down, every claim verified with a measurement.`;
  },
  (title, topic) => {
    const proj = pickProjectFor(topic.category);
    return `The case study that convinced me this approach was correct came from an inherited codebase that became ${proj}. The old code worked — until it stopped working, and nobody could explain why. The refactor to the patterns in this article took three weeks, and the first bug report afterwards was resolved in an hour instead of a day.\n\nSince then, ${proj} has shipped dozens of features without a single incident requiring a rollback. That is the whole argument of this article, made concrete: structure is what makes software safe to change.`;
  },
];

const TOPIC_TO_PROJECT = {
  Architecture: "InvoiceFlow",
  Backend: "PayConnect",
  MongoDB: "HabitStack",
  Security: "ShopSphere",
  SEO: "ContentForge",
  Frontend: "PulseBoard",
  DevOps: "TaskFlow Pro",
  Performance: "EventPulse",
  Career: "DevBench",
  Tools: "NoteNest",
};

const TOPIC_TO_BLOG_SLUG = {
  Architecture: "designing-modular-mvc-systems-that-survive-growth",
  Backend: "building-resilient-rest-apis-with-express-and-node-js",
  MongoDB: "mongodb-schema-design-for-real-world-applications",
  Security: "securing-full-stack-applications-in-2026-a-practical-guide",
  SEO: "the-complete-guide-to-technical-seo-for-content-platforms",
  Frontend: "modern-frontend-techniques-for-server-rendered-apps",
  DevOps: "deploying-node-js-applications-the-right-way",
  Performance: "performance-optimization-for-content-heavy-websites",
  Career: "growing-from-junior-to-senior-full-stack-developer",
  Tools: "the-modern-developer-toolkit-in-2026",
};

function pickProjectFor(category) {
  return TOPIC_TO_PROJECT[category] || "InvoiceFlow";
}

function buildPost(topic, postIdx, globalIdx) {
  const title = topic.titles[postIdx % topic.titles.length];
  const slug = slugify(title);
  const rot = postIdx % 3;
  const hook = HOOKS[rot](title);
  const intro = rotate(topic.intro, rot);
  const caseStudy = CASE_STUDIES[rot](title, topic);
  const conclusion = rotate(topic.conclusion, rot);
  const extra = EXTRA_BLOCKS[topic.category];
  const faqs = [...topic.faqs, ...extra.faqs];
  const caseLessons = [
    `The lesson that cost the most in ${topic.category.toLowerCase()}: measure before changing anything, and let the data pick the fix.`,
    `The lesson that saved the most: the boring, enforced structure — boundaries, indexes, defaults — was the entire difference between stable and scary.`,
    `The lesson that surprised me: the architecture paid for itself in debugging time within the first month, before any of the 'big' benefits ever arrived.`,
  ];
  const images = [
    mdImage(slug, 1, `${topic.category} concept`, "The architecture in practice: layered boundaries keep every module independently changeable."),
    mdImage(slug, 2, `${topic.category} workflow`, "The pattern applied: consistent structure is what makes software safe to change."),
    mdImage(slug, 3, `${topic.category} results`, "The payoff: measurable improvements that compound across every project."),
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
    topic.whyItMatters.paragraphs.join("\n\n"),
    "",
    mdList(topic.whyItMatters.bullets),
    "",
    "## The Problem",
    "",
    topic.problem.join("\n\n"),
    "",
    "## The Approach",
    "",
    topic.approach.paragraphs.join("\n\n"),
    "",
    topic.approach.codeLead,
    "",
    topic.approach.code,
    "",
    images[1],
    "",
    mdTable(topic.comparison),
    "",
    "## Implementation",
    "",
    topic.implementation.paragraphs.join("\n\n"),
    "",
    mdList(topic.implementation.bullets),
    "",
    "## Key Decisions",
    "",
    topic.keyDecisions
      .map((d) => `### ${d.heading}\n\n${d.text}`)
      .join("\n\n"),
    "",
    "## Common Mistakes to Avoid",
    "",
    extra.mistakes.paragraphs.join("\n\n"),
    "",
    mdList(extra.mistakes.bullets),
    "",
    "## Patterns That Scale",
    "",
    extra.patterns.paragraphs.join("\n\n"),
    "",
    mdList(extra.patterns.bullets),
    "",
    "## Real-World Example",
    "",
    topic.realWorld.join("\n\n"),
    "",
    "## Case Study: " + title,
    "",
    caseStudy,
    "",
    mdList(caseLessons),
    "",
    images[2],
    "",
    "## Putting It Into Practice",
    "",
    extra.practice.join("\n\n"),
    "",
    "## How This Applies to Your Stack",
    "",
    extra.stack.join("\n\n"),
    "",
    "## Key Takeaways",
    "",
    mdList(topic.checklist),
    "",
    "## Frequently Asked Questions",
    "",
    faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n"),
    "",
    "## Conclusion",
    "",
    conclusion.join("\n\n"),
    "",
  ];

  const content = parts.filter((p) => p !== "").join("\n\n");
  const excerpt = excerptFrom(content);
  const words = content.split(/\s+/).length;

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
    words,
  };
}

const PROJECT_OPENERS = [
  (title, summary) => `${title} began as a practical answer to a daily annoyance: ${summary.toLowerCase().replace(/\.$/, "")}. What started as a scratch solution grew into a full product because the problems it solved kept recurring — for me first, and then for everyone who saw it in action.`,
  (title, summary) => `The origin of ${title} is boring in the best way: ${summary.toLowerCase().replace(/\.$/, "")} was a recurring pain, and the existing tools made it worse with friction instead of better. This project is the alternative — built with the production discipline described throughout this portfolio.`,
  (title, summary) => `Every product here started with a question, and ${title} started with: how hard would it be to ${summary.toLowerCase().replace(/\.$/, "")}? The answer turned out to be 'harder than a weekend, worth more than a year' — and the result is a full-stack platform built on the patterns documented in the blog.`,
];

const PROJECT_CONCLUSIONS = [
  (title) => `${title} is a live demonstration of everything this portfolio preaches: modular architecture, indexed queries, server rendering, and deployment pipelines that make shipping boring. The patterns are public in the blog articles — steal them, adapt them, and build something that outgrows its prototype without collapsing.`,
  (title) => `The measure of ${title} is not its feature list but its uptime. It has served real users through real traffic with zero downtime, because it was designed to be operated, not just built. That is the standard this portfolio holds for every project.`,
  (title) => `If you are building something similar, the lesson of ${title} is to invest in structure before scale. The boundaries, indexes, and automation that make it resilient were decisions made early — and every later feature inherited their benefit.`,
];

function buildProject(type, projectIdx, globalIdx) {
  const [title, summary] = type.titles[projectIdx % type.titles.length];
  const slug = slugify(title);
  const rot = projectIdx % 3;
  const opener = PROJECT_OPENERS[rot](title, summary);
  const conclusion = PROJECT_CONCLUSIONS[rot](title);

  const parts = [
    opener,
    "",
    type.overview,
    "",
    "## Features",
    "",
    mdList(type.features),
    "",
    "## Architecture",
    "",
    type.architecture,
    "",
    mdTable(type.techDecisions),
    "",
    "## Real-World Impact",
    "",
    type.realWorld,
    "",
    "## Measured Results",
    "",
    mdList(type.metrics),
    "",
    "## Frequently Asked Questions",
    "",
    type.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n"),
    "",
    "## Conclusion",
    "",
    conclusion,
    "",
  ];

  const description = parts.filter((p) => p !== "").join("\n\n");
  const gallery = [1, 2, 3, 4].map((n) => PICSUM(`${slug}-g${n}`, 900, 600));

  return {
    title,
    slug,
    summary,
    description,
    coverImage: gallery[0],
    gallery,
    techStack: type.techStack,
    categories: [type.category],
    links: {
      live: `https://${slug}.vercel.app`,
      github: `https://github.com/kabirmahmud/${slug}`,
      caseStudy: `/blog/${TOPIC_TO_BLOG_SLUG[type.category] || "designing-modular-mvc-systems-that-survive-growth"}`,
    },
    status: "published",
    featured: globalIdx % 7 === 0,
    order: globalIdx,
    seo: {
      title,
      description: summary.slice(0, 155),
      ogImage: gallery[0],
      noIndex: false,
    },
    publishedAt: new Date(Date.now() - (globalIdx + 1) * 6 * 3600e3),
    words: description.split(/\s+/).length,
  };
}

async function main() {
  await mongoose.connect(dbConfig.uri);
  console.log("Connected to MongoDB. Seeding demo content...");

  if (WIPE) {
    console.log("--wipe: clearing existing posts and projects...");
    await Promise.all([Post.deleteMany({}), Project.deleteMany({})]);
  }

  const posts = [];
  let global = 0;
  ALL_TOPICS.forEach((topic, tIdx) => {
    for (let p = 0; p < 5; p++) {
      posts.push(buildPost(topic, p + tIdx * 3, global++));
    }
  });

  const projects = [];
  let pGlobal = 0;
  PROJECT_TYPES.forEach((type, tIdx) => {
    for (let p = 0; p < 5; p++) {
      projects.push(buildProject(type, p + tIdx * 3, pGlobal++));
    }
  });

  const postWords = posts.map((p) => p.words);
  const projectWords = projects.map((p) => p.words);
  console.log(
    `Post word count -> min: ${Math.min(...postWords)}, max: ${Math.max(...postWords)}, avg: ${Math.round(postWords.reduce((a, b) => a + b, 0) / postWords.length)}`
  );
  console.log(
    `Project word count -> min: ${Math.min(...projectWords)}, max: ${Math.max(...projectWords)}`
  );

  const postOps = posts.map((p) => ({
    updateOne: {
      filter: { slug: p.slug },
      update: { $set: p },
      upsert: true,
    },
  }));
  const projectOps = projects.map((p) => ({
    updateOne: {
      filter: { slug: p.slug },
      update: { $set: p },
      upsert: true,
    },
  }));

  const postRes = await Post.bulkWrite(postOps, { ordered: false });
  const projectRes = await Project.bulkWrite(projectOps, { ordered: false });

  console.log(
    `Posts: ${postRes.upsertedCount} created, ${postRes.modifiedCount} updated`
  );
  console.log(
    `Projects: ${projectRes.upsertedCount} created, ${projectRes.modifiedCount} updated`
  );
  console.log("Done. Visit /blog and /projects to explore the demo content.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
