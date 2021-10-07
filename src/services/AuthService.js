import { api } from 'boot/axios'

export default class AuthService {
  static async login(email, password) {
    return api.post('/api/auth/admin', { email, password })
  }

  static async logout() {
    return api.post('/api/auth/logout')
  }
}
