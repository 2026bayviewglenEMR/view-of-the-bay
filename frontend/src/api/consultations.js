import { http } from "./http";

export const consultationsApi = {
  getFlowConfig: () =>
    http.get("/consultations/flow-config").then((response) => response.data),

  createConsultation: (payload) =>
    http.post("/consultations", payload).then((response) => response.data),

  completeTemplateConsultation: (payload) =>
    http.post("/consultations/complete", payload).then((response) => response.data),

  getConsultation: (consultationId) =>
    http.get(`/consultations/${consultationId}`).then((response) => response.data),

  updateConsultation: (consultationId, payload) =>
    http.put(`/consultations/${consultationId}`, payload).then((response) => response.data),

  completeConsultation: (consultationId) =>
    http.post(`/consultations/${consultationId}/complete`).then((response) => response.data),

  getPatientRecords: (patientId) =>
    http.get(`/consultations/patient/${patientId}/records`).then((response) => response.data),

  saveTreatmentPlan: (consultationId, payload) =>
    http.post(`/consultations/${consultationId}/treatment-plan`, payload).then((response) => response.data),

  createTestOrder: (consultationId, payload) =>
    http.post(`/consultations/${consultationId}/test-orders`, payload).then((response) => response.data),
};
