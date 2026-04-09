import { http } from './http'

export const api = {
    testServer: () => http.get('/').then(r => r.data),

    //auth
    signIn: (username, password) => http.post('/auth/signIn', {username, password}).then(r => r.data),
    updatePassword: (newPassword) => http.post('/auth/updatePassword', {newPassword}).then(r => r.data),
}
