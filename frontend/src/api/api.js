import { http } from './http'

export const api = {
    //temp test routes
    testServer: () => http.get('/').then(r => r.data),
    doctorOnly: () => http.get('/doctorOnly').then(r => r.data),
    adminOnly: () => http.get('/adminOnly').then(r => r.data),

    getDoctors: () => http.get('/doctors').then(r => r.data),
    getUsers: () => http.get('/users').then(r => r.data),

    getAppointments: () => http.get('/appointments').then(r => r.data),

    //drugs
    getInteractions: (id1, id2) => http.get(`/drugs/${id1}/${id2}`).then(r => r.data),
    getDrugs: (query) => http.get(`/drugs/${query}`),

    //auth
    signIn: (username, password) => http.post('/auth/signIn', {username, password}).then(r => r.data),
    updatePassword: (newPassword) => http.post('/auth/updatePassword', {newPassword}).then(r => r.data),
    createUser: ({username, password, firstName, lastName, email, role}) => http.post('/auth/createUser', { username, password, firstName, lastName, email, role }),

    // messaging
    sendMessage: (senderId, receiverId, content, attachments = []) =>
        http.post('/messages', { senderId, receiverId, content, attachments }).then(r => r.data),
    loadMessages: (userId, otherUserId) => http.get(`/messages/${userId}/${otherUserId}`).then(r => r.data),
    markAsRead: (messageId) => http.patch(`/messages/${messageId}/read`).then(r => r.data),
    getConversations: (userId) => http.get(`/messages/conversations/${userId}`).then(r => r.data),

    uploadAttachment: (formData) => http.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),

    // patient portal
    getPortalData: (patientId) => http.get(`/patient-portal/${patientId}`).then(r => r.data),
    createAppointment: (patientId, data) => http.post(`/patient-portal/${patientId}/appointments`, data).then(r => r.data),
    updateAppointment: (patientId, appointmentId, data) => http.put(`/patient-portal/${patientId}/appointments/${appointmentId}`, data).then(r => r.data),
    deleteAppointment: (patientId, appointmentId) => http.delete(`/patient-portal/${patientId}/appointments/${appointmentId}`).then(r => r.data),

    // patients
    getPatient: (id) => http.get(`/patients/${id}`).then(r => r.data),
    getPatientSummary: (id) => http.get(`/patients/${id}/summary`).then(r => r.data),
    getPatientEncounters: (id) => http.get(`/patients/${id}/encounters`).then(r => r.data),
    getAllPatients: () => http.get('/patients').then(r => r.data),

    // dashboard
    getTodaysAppointments: () => http.get('/dashboard/appointments/today').then(r => r.data),

    // patient search (for waiting room check-in)
    searchPatients: (q) => http.get(`/patient-search/search?q=${encodeURIComponent(q)}`).then(r => r.data),

    // waiting room
    getWaitingRoom: () => http.get('/waiting-room').then(r => r.data),
    getDoctorsOverview: () => http.get('/waiting-room/doctors').then(r => r.data),
    checkInPatient: (appointmentId, note, flag) => http.post('/waiting-room/check-in', { appointmentId, note, flag }).then(r => r.data),
    updatePatientStatus: (id, status) => http.patch(`/waiting-room/${id}/status`, { status }).then(r => r.data),
    removePatient: (id) => http.delete(`/waiting-room/${id}`).then(r => r.data),
}
