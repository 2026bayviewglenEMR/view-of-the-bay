import { http } from './http'

export const api = {
    testServer: () => http.get('/').then(r => r.data),

    //auth
    signIn: (username, password) => http.post('/auth/signIn', {username, password}).then(r => r.data),
    updatePassword: (newPassword) => http.post('/auth/updatePassword', {newPassword}).then(r => r.data),

    // comms
    sendMessage: (senderId, receiverId, message) => http.post('/comms/send', {senderId, receiverId, message}).then(r => r.data),
    loadMessages: (userId) => http.get(`/comms/${userId}/messages`).then(r => r.data)
}