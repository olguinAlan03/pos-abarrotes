import apiClient from './client'
import type { Product, Category } from '../types'

interface ProductPayload {
  name: string
  barcode: string
  price: number
  cost: number
  stock: number
  categoryKey: string
}

export const productsApi = {
  getAll: async (search?: string, categoryKey?: string) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (categoryKey) params.categoryKey = categoryKey
    const { data } = await apiClient.get<Product[]>('/api/products', { params })
    return data
  },
  getByBarcode: async (barcode: string) => {
    const { data } = await apiClient.get<Product>(`/api/products/barcode/${barcode}`)
    return data
  },
  getById: async (productKey: string) => {
    const { data } = await apiClient.get<Product>(`/api/products/${productKey}`)
    return data
  },
  create: async (payload: ProductPayload) => {
    const { data } = await apiClient.post<Product>('/api/products', payload)
    return data
  },
  update: async (productKey: string, payload: Partial<ProductPayload>) => {
    const { data } = await apiClient.put<Product>(`/api/products/${productKey}`, payload)
    return data
  },
  remove: async (productKey: string) => {
    await apiClient.delete(`/api/products/${productKey}`)
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
