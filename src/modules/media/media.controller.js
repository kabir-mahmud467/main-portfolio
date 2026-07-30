import { buildMeta } from "../../core/utils/metaBuilder.js";
import { getAllMedia, uploadFile, deleteMedia, updateMediaAlt } from "./media.service.js";

export async function renderAdminMedia(req, res) {
  const media = await getAllMedia();
  res.render("admin/media/index", {
    layout: "layouts/admin",
    title: "Media Library",
    meta: buildMeta(req, { title: "Media Library", noIndex: true }),
    media
  });
}

export async function handleUpload(req, res) {
  if (!req.file) {
    req.flash("error", "No file selected.");
    return res.redirect("/admin/media");
  }

  await uploadFile(req.file);
  req.flash("success", "File uploaded.");
  res.redirect("/admin/media");
}

export async function handleDeleteMedia(req, res) {
  const result = await deleteMedia(req.params.id);
  if (!result) {
    req.flash("error", "Media not found.");
  } else {
    req.flash("success", "Media deleted.");
  }
  res.redirect("/admin/media");
}

export async function handleUpdateAlt(req, res) {
  await updateMediaAlt(req.params.id, req.body.alt);
  req.flash("success", "Alt text updated.");
  res.redirect("/admin/media");
}
