import { create } from 'zustand'
import type { CartItem, Product, PaymentMethod } from '../types'

interface CartStore {
  items: CartItem[]
  paymentMethod: PaymentMethod
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  setPaymentMethod: (method: PaymentMethod) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  paymentMethod: 'CASH',

  addItem: (product, quantity = 1) => {
    const items = get().items
    const existing = items.find((i) => i.product.id === product.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id
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

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId
          ? { ...i, quantity, subtotal: Math.round(i.product.price * quantity) }
          : i,
      ),
    })
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) })
  },

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  clearCart: () => set({ items: [], paymentMethod: 'CASH' }),

  getTotal: () => get().items.reduce((acc, i) => acc + i.subtotal, 0),
}))
