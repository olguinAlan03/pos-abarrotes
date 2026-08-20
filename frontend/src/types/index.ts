export type UserRole = 'admin' | 'cashier'

export interface User {
  user_key: string
  username: string
  role: UserRole
}

export interface AuthState {
  user: User | null
  accessToken: string | null
}

export interface Category {
  category_key: string
  name: string
}

export interface Product {
  product_key: string
  barcode: string
  name: string
  price: number
  cost: number
  stock: number
  category_key: string
  category: Category
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT'

export interface CreateSaleDto {
  items: { productKey: string; quantity: number }[]
  paymentMethod: PaymentMethod
}

export interface SaleItem {
  sale_items_key: string
  sale_key: string
  product_key: string
  product: Product
  quantity: number
  subtotal: number
}

export interface Sale {
  sale_key: string
  saleItems: SaleItem[]
  total: number
  payment_method: PaymentMethod
  user_key: string
  created_at: string
}
