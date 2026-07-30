import { buildMeta } from "../../core/utils/metaBuilder.js";

export function renderContactPage(req, res) {
  res.render("pages/contact", {
    title: "Contact",
    meta: buildMeta(req, {
      title: "Contact",
      description: "Contact Kabir Mahmud for software architecture, full-stack engineering, and web platform work."
    })
  });
}
