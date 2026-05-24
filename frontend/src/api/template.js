import { http } from "./http";

export function getTemplates() {
  return http.get("/templates").then((response) => response.data);
}

export function getMyTemplates() {
  return http.get("/templates/my").then((response) => response.data);
}

export function createMyTemplate(payload) {
  return http.post("/templates/my", payload).then((response) => response.data);
}

export function updateMyTemplate(templateId, payload) {
  return http.patch(`/templates/my/${templateId}`, payload).then((response) => response.data);
}

export function deleteMyTemplate(templateId) {
  return http.delete(`/templates/my/${templateId}`).then((response) => response.data);
}

export function saveTemplateConsultation(payload) {
  return http.post("/consultations/complete", payload).then((response) => response.data);
}
