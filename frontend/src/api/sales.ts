import apiClient from './client'
import type { Sale, CreateSaleDto } from '../types'

export const salesApi = {
  create: async (dto: CreateSaleDto) => {
    const { data } = await apiClient.post<Sale>('/api/sales', dto)
    return data
  },
  getAll: async (page = 1) => {
    const { data } = await apiClient.get<Sale[]>('/api/sales', { params: { page } })
    return data
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<Sale>(`/api/sales/${id}`)
    return data
  },
}
