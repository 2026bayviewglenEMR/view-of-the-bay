import { http } from './http'

export const api = {
    //temp test routes
    testServer: () => http.get('/').then(r => r.data),
    doctorOnly: () => http.get('/doctorOnly').then(r => r.data),
    adminOnly: () => http.get('/adminOnly').then(r => r.data),

    getDoctors: () => http.get('/doctors').then(r => r.data),

    //auth
    signIn: (username, password) => http.post('/auth/signIn', {username, password}).then(r => r.data),
    updatePassword: (newPassword) => http.post('/auth/updatePassword', {newPassword}).then(r => r.data),
    createUser: ({username, password, firstName, lastName, email, role}) => http.post('/auth/createUser', { username, password, firstName, lastName, email, role }),

    // comms
    sendMessage: (senderId, receiverId, message) => http.post('/comms/send', {senderId, receiverId, message}).then(r => r.data),
    loadMessages: (userId) => http.get(`/comms/${userId}/messages`).then(r => r.data),

    // patient portal
    getPortalData: (patientId) => http.get(`/patient-portal/${patientId}`).then(r => r.data),
    createAppointment: (patientId, data) => http.post(`/patient-portal/${patientId}/appointments`, data).then(r => r.data),
    updateAppointment: (patientId, appointmentId, data) => http.put(`/patient-portal/${patientId}/appointments/${appointmentId}`, data).then(r => r.data),
    deleteAppointment: (patientId, appointmentId) => http.delete(`/patient-portal/${patientId}/appointments/${appointmentId}`).then(r => r.data),
}