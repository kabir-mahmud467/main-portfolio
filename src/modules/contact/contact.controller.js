import { buildMeta } from "../../core/utils/metaBuilder.js";
import { submitContactMessage } from "./contact.service.js";

export function renderContactPage(req, res) {
  res.render("pages/contact", {
    title: "Contact",
    meta: buildMeta(req, {
      title: "Contact",
      description: "Contact Kabir Mahmud for software architecture, full-stack engineering, and web platform work."
    }),
    form: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
}

export async function handleContactSubmit(req, res, next) {
  try {
    await submitContactMessage(req.body);
    req.flash("success", "Thanks. Your message has been received.");
    res.redirect("/contact");
  } catch (error) {
    next(error);
  }
}
