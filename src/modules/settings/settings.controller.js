import { buildMeta } from "../../core/utils/metaBuilder.js";
import { getAllSettings, updateSettings } from "./settings.service.js";

export async function renderAdminSettings(req, res) {
  const settings = await getAllSettings();
  res.render("admin/settings/index", {
    layout: "layouts/admin",
    title: "Settings",
    meta: buildMeta(req, { title: "Settings", noIndex: true }),
    settings,
    sections: Object.keys(settings)
  });
}

export async function handleUpdateSettings(req, res) {
  const { group } = req.params;
  const values = {};

  for (const [key, value] of Object.entries(req.body)) {
    if (key !== "_csrf") {
      values[key] = value;
    }
  }

  await updateSettings(group, values);
  req.flash("success", "Settings saved.");
  res.redirect("/admin/settings");
}
