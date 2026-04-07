import { http } from './http'

export const api = {
    testServer: () => http.get('/').then(r => r.data),
}
