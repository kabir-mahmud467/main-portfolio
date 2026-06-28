function byId(id) {
  return document.getElementById(id);
}

function copy(text) {
  navigator.clipboard?.writeText(text);
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
  );
}

const passwordForm = byId("password-tool");
if (passwordForm) {
  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const length = Number(byId("password-length").value || 16);
    const chars = [
      byId("password-lower").checked ? "abcdefghijklmnopqrstuvwxyz" : "",
      byId("password-upper").checked ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
      byId("password-number").checked ? "0123456789" : "",
      byId("password-symbol").checked ? "!@#$%^&*()_+-=[]{};:,.<>?" : ""
    ].join("") || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = crypto.getRandomValues(new Uint32Array(length));
    byId("tool-output").value = Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
  });
}

const qrForm = byId("qr-tool");
if (qrForm) {
  qrForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = encodeURIComponent(byId("qr-input").value);
    byId("qr-output").src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${value}`;
  });
}

const jsonForm = byId("json-tool");
if (jsonForm) {
  jsonForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      byId("tool-output").value = JSON.stringify(JSON.parse(byId("tool-input").value), null, 2);
    } catch (error) {
      byId("tool-output").value = `Invalid JSON: ${error.message}`;
    }
  });
}

const base64Encode = byId("base64-encode-tool");
if (base64Encode) {
  base64Encode.addEventListener("submit", (event) => {
    event.preventDefault();
    byId("tool-output").value = btoa(unescape(encodeURIComponent(byId("tool-input").value)));
  });
}

const base64Decode = byId("base64-decode-tool");
if (base64Decode) {
  base64Decode.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      byId("tool-output").value = decodeURIComponent(escape(atob(byId("tool-input").value)));
    } catch {
      byId("tool-output").value = "Invalid Base64 input.";
    }
  });
}

const counter = byId("counter-tool");
if (counter) {
  counter.addEventListener("input", () => {
    const text = byId("tool-input").value;
    byId("tool-output").value = JSON.stringify(
      {
        characters: text.length,
        charactersWithoutSpaces: text.replace(/\s/g, "").length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text ? text.split(/\r?\n/).length : 0,
        paragraphs: text.trim() ? text.trim().split(/\n\s*\n/).length : 0
      },
      null,
      2
    );
  });
}

const uuidTool = byId("uuid-tool");
if (uuidTool) {
  uuidTool.addEventListener("submit", (event) => {
    event.preventDefault();
    const count = Math.min(100, Math.max(1, Number(byId("uuid-count").value || 1)));
    byId("tool-output").value = Array.from({ length: count }, uuidv4).join("\n");
  });
}

const loremTool = byId("lorem-tool");
if (loremTool) {
  loremTool.addEventListener("submit", (event) => {
    event.preventDefault();
    const sentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    const count = Math.min(20, Math.max(1, Number(byId("lorem-count").value || 3)));
    byId("tool-output").value = Array.from({ length: count }, () => sentence).join("\n\n");
  });
}

const colorTool = byId("color-tool");
if (colorTool) {
  colorTool.addEventListener("submit", (event) => {
    event.preventDefault();
    const hex = byId("color-input").value.replace("#", "");
    const bigint = parseInt(hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    byId("tool-output").value = `HEX: #${hex}\nRGB: rgb(${r}, ${g}, ${b})`;
  });
}

const timestampTool = byId("timestamp-tool");
if (timestampTool) {
  timestampTool.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = byId("timestamp-input").value.trim();
    const date = /^\d+$/.test(input) ? new Date(Number(input) * 1000) : new Date(input);
    byId("tool-output").value = `ISO: ${date.toISOString()}\nUnix: ${Math.floor(date.getTime() / 1000)}\nLocal: ${date.toString()}`;
  });
}

const diffTool = byId("diff-tool");
if (diffTool) {
  diffTool.addEventListener("submit", (event) => {
    event.preventDefault();
    const left = byId("diff-left").value.split(/\r?\n/);
    const right = byId("diff-right").value.split(/\r?\n/);
    const max = Math.max(left.length, right.length);
    byId("tool-output").value = Array.from({ length: max }, (_, i) =>
      left[i] === right[i] ? `  ${left[i] || ""}` : `- ${left[i] || ""}\n+ ${right[i] || ""}`
    ).join("\n");
  });
}

const imageTool = byId("image-tool");
if (imageTool) {
  imageTool.addEventListener("submit", (event) => {
    event.preventDefault();
    const file = byId("image-input").files[0];
    const format = byId("image-format")?.value || "image/jpeg";
    const quality = Number(byId("image-quality")?.value || 0.75);
    if (!file) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
      byId("image-output").href = canvas.toDataURL(format, quality);
      byId("image-output").classList.remove("hidden");
    };
    image.src = URL.createObjectURL(file);
  });
}

document.querySelectorAll("[data-copy-output]").forEach((button) => {
  button.addEventListener("click", () => copy(byId("tool-output")?.value || ""));
});
