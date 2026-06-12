export type UserRole = 'admin' | 'cashier'

export interface User {
  id: string
  username: string
  role: UserRole
}

export interface AuthState {
  user: User | null
  accessToken: string | null
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  barcode: string | null
  price: number
  cost: number
  categoryId: number
  category: Category
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT'

export interface CreateSaleDto {
  items: { productId: number; quantity: number }[]
  paymentMethod: PaymentMethod
}

export interface SaleItem {
  id: number
  productId: number
  product: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  items: SaleItem[]
  total: number
  paymentMethod: PaymentMethod
  status: 'COMPLETED' | 'VOIDED'
  cashierId: string
  createdAt: string
}

export interface Stock {
  id: number
  productId: number
  quantity: number
  lowStockThreshold: number
  product: Product
}
