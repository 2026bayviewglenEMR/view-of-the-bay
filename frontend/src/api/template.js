import { http } from './http'

export const templateApi = {
  getMyTemplates: () => http.get('/templates/my').then((r) => r.data),
  createMyTemplate: (templateData) => http.post('/templates/my', templateData).then((r) => r.data),
  updateMyTemplate: (id, templateData) => http.put(`/templates/my/${id}`, templateData).then((r) => r.data),
  getClinicTemplates: () => http.get('/templates/clinic').then((r) => r.data),
  createClinicTemplate: (templateData) => http.post('/templates/clinic', templateData).then((r) => r.data),
  updateClinicTemplate: (id, templateData) => http.put(`/templates/clinic/${id}`, templateData).then((r) => r.data),
}
