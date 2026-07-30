import { Setting } from "./settings.model.js";

const DEFAULT_SETTINGS = {
  site: {
    title: { value: "Kabir Mahmud", group: "site", description: "Site title" },
    description: { value: "Portfolio, technical writing, projects, and useful online tools by Kabir Mahmud.", group: "site", description: "Site description" },
    keywords: { value: "portfolio, developer, full-stack, node.js, express, mongodb", group: "site", description: "SEO keywords" }
  },
  social: {
    github: { value: "", group: "social", description: "GitHub profile URL" },
    twitter: { value: "", group: "social", description: "Twitter/X profile URL" },
    linkedin: { value: "", group: "social", description: "LinkedIn profile URL" }
  }
};

export async function getAllSettings() {
  const dbSettings = await Setting.find().lean();
  const all = {};

  for (const [group, fields] of Object.entries(DEFAULT_SETTINGS)) {
    all[group] = {};
    for (const [key, def] of Object.entries(fields)) {
      const db = dbSettings.find((s) => s.key === `${group}.${key}`);
      all[group][key] = db ? db.value : def.value;
    }
  }

  return all;
}

export async function getSetting(key) {
  const setting = await Setting.findOne({ key }).lean();
  return setting ? setting.value : null;
}

export async function updateSettings(group, values) {
  const operations = Object.entries(values).map(([key, value]) => ({
    updateOne: {
      filter: { key: `${group}.${key}` },
      update: { $set: { key: `${group}.${key}`, value, group } },
      upsert: true
    }
  }));
  return Setting.bulkWrite(operations);
}

export async function seedDefaultSettings() {
  const count = await Setting.countDocuments();
  if (count > 0) return;

  const docs = [];
  for (const [group, fields] of Object.entries(DEFAULT_SETTINGS)) {
    for (const [key, def] of Object.entries(fields)) {
      docs.push({
        key: `${group}.${key}`,
        value: def.value,
        group,
        description: def.description
      });
    }
  }
  return Setting.insertMany(docs);
}
