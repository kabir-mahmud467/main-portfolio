import { createContactMessage } from "./contact.repository.js";

export async function submitContactMessage(payload) {
  return createContactMessage({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message
  });
}
