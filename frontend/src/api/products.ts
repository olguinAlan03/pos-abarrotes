import apiClient from './client'
import type { Product, Category } from '../types'

export const productsApi = {
  getAll: async (search?: string, categoryId?: number) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (categoryId) params.categoryId = String(categoryId)
    const { data } = await apiClient.get<Product[]>('/api/products', { params })
    return data
  },
  getByBarcode: async (barcode: string) => {
    const { data } = await apiClient.get<Product>(`/api/products/barcode/${barcode}`)
    return data
  },
  getById: async (id: number) => {
    const { data } = await apiClient.get<Product>(`/api/products/${id}`)
    return data
  },
  create: async (payload: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Product>('/api/products', payload)
    return data
  },
  update: async (id: number, payload: Partial<Product>) => {
    const { data } = await apiClient.put<Product>(`/api/products/${id}`, payload)
    return data
  },
  remove: async (id: number) => {
    await apiClient.delete(`/api/products/${id}`)
  },
  getCategories: async () => {
    const { data } = await apiClient.get<Category[]>('/api/categories')
    return data
  },
  createCategory: async (name: string) => {
    const { data } = await apiClient.post<Category>('/api/categories', { name })
    return data
  },
}
