import http from "./http";

export function saveConsultation(formData) {
  return http.post("/consultation-templates", formData);
}