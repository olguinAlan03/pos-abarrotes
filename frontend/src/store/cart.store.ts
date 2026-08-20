import { create } from 'zustand'
import type { CartItem, Product, PaymentMethod } from '../types'

interface CartStore {
  items: CartItem[]
  paymentMethod: PaymentMethod
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (productKey: string, quantity: number) => void
  removeItem: (productKey: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  paymentMethod: 'CASH',

  addItem: (product, quantity = 1) => {
    const items = get().items
    const existing = items.find((i) => i.product.product_key === product.product_key)
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.product_key === product.product_key
            ? {
                ...i,
                quantity: i.quantity + quantity,
                subtotal: Math.round(product.price * (i.quantity + quantity)),
              }
            : i,
        ),
      })
    } else {
      set({
        items: [
          ...items,
          { product, quantity, subtotal: Math.round(product.price * quantity) },
        ],
      })
    }
  },

  updateQuantity: (productKey, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productKey)
      return
    }
    set({
      items: get().items.map((i) =>
        i.product.product_key === productKey
          ? { ...i, quantity, subtotal: Math.round(i.product.price * quantity) }
          : i,
      ),
    })
  },

  removeItem: (productKey) => {
    set({ items: get().items.filter((i) => i.product.product_key !== productKey) })
  },

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  clearCart: () => set({ items: [], paymentMethod: 'CASH' }),

  getTotal: () => get().items.reduce((acc, i) => acc + i.subtotal, 0),
}))
