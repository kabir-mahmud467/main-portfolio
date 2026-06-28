import { ContactMessage } from "./contact.model.js";

export function createContactMessage(payload) {
  return ContactMessage.create(payload);
}
