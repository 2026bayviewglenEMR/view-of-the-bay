import { http } from './http'

export const api = {
    testServer: () => http.get('/').then(r => r.data),

    //auth
    signIn: (username, password) => http.post('/auth/signIn', {username, password}).then(r => r.data),
    updatePassword: (newPassword) => http.post('/auth/updatePassword', {newPassword}).then(r => r.data),

    //don't have backend url yet
    //sendMessage: (message) => http.post('', {message}).then(r => r.data)
    //loadMessages: () => http.get('').then(r => r.data)
}
