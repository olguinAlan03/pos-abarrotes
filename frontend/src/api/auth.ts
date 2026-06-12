import apiClient from './client'
import type { User } from '../types'

export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await apiClient.post<{ accessToken: string; user: User }>(
      '/api/auth/login',
      { username, password },
    )
    return data
  },
  getMe: async () => {
    const { data } = await apiClient.get<User>('/api/auth/me')
    return data
  },
}
