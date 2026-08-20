import { useRef, useState, useCallback } from 'react'
import { useCartStore } from '@/store/cart.store'
import { productsApi } from '@/api/products'
import { salesApi } from '@/api/sales'
import { formatMXN } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { es } from '@/i18n/es'
import type { PaymentMethod } from '@/types'

const t = es.pos

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: t.paymentMethods.CASH },
  { value: 'CARD', label: t.paymentMethods.CARD },
  { value: 'CREDIT', label: t.paymentMethods.CREDIT },
]

export function PosPage() {
  const barcodeRef = useRef<HTMLInputElement>(null)
  const [barcode, setBarcode] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [checkoutSuccess, setCheckoutSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { items, paymentMethod, addItem, updateQuantity, removeItem, setPaymentMethod, clearCart, getTotal } =
    useCartStore()

  const refocusBarcode = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50)
  }, [])

  async function handleBarcodeSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const code = barcode.trim()
    if (!code) return

    setLookupError('')
    setBarcode('')

    try {
      const product = await productsApi.getByBarcode(code)
      addItem(product)
    } catch {
      setLookupError(t.notFound(code))
    } finally {
      refocusBarcode()
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return
    setIsSubmitting(true)
    const currentTotal = getTotal()
    try {
      await salesApi.create({
        items: items.map((i) => ({ productKey: i.product.product_key, quantity: i.quantity })),
        paymentMethod,
      })
      clearCart()
      setCheckoutSuccess(t.saleSuccess(formatMXN(currentTotal)))
      setTimeout(() => setCheckoutSuccess(''), 4000)
    } catch (err: any) {
      setLookupError(err?.response?.data?.message ?? t.checkoutError)
    } finally {
      setIsSubmitting(false)
      refocusBarcode()
    }
  }

  const total = getTotal()
  const totalItems = items.reduce((a, i) => a + i.quantity, 0)

  return (
    <div className="flex h-full">
      {/* ── Cart area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barcode input row */}
        <div className="px-5 pt-5 pb-3 border-b bg-white">
          <Input
            ref={barcodeRef}
            autoFocus
            placeholder={t.barcodePlaceholder}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeSubmit}
            className="h-11 text-base"
          />
          {lookupError && (
            <p className="text-red-500 text-sm mt-1.5">{lookupError}</p>
          )}
        </div>

        {/* Success banner */}
        {checkoutSuccess && (
          <div className="mx-5 mt-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
            {checkoutSuccess}
          </div>
        )}

        {/* Cart content */}
        <div className="flex-1 overflow-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 select-none">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <ShoppingCart size={28} className="text-gray-300" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-medium text-gray-500">{t.emptyCart.heading}</p>
                <p className="text-sm text-gray-400">{t.emptyCart.hint}</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-400">
                  <th className="pb-2.5 font-medium">{t.table.product}</th>
                  <th className="pb-2.5 font-medium text-center w-28">{t.table.qty}</th>
                  <th className="pb-2.5 font-medium text-right w-28">{t.table.price}</th>
                  <th className="pb-2.5 font-medium text-right w-28">{t.table.subtotal}</th>
                  <th className="pb-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ product, quantity, subtotal }) => (
                  <tr key={product.product_key} className="border-b hover:bg-gray-50/70">
                    <td className="py-2.5">
                      <p className="font-medium text-gray-800">{product.name}</p>
                      {product.barcode && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{product.barcode}</p>
                      )}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateQuantity(product.product_key, quantity - 1)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-medium tabular-nums">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.product_key, quantity + 1)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-gray-500">{formatMXN(product.price)}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">{formatMXN(subtotal)}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => removeItem(product.product_key)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Checkout panel ── */}
      <div className="w-72 bg-white border-l flex flex-col shrink-0">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-base text-gray-800">{t.checkout.title}</h2>
        </div>

        {/* Payment method */}
        <div className="px-5 py-4 border-b space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t.checkout.paymentMethod}
          </p>
          <div className="grid gap-1.5">
            {PAYMENT_METHODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                  paymentMethod === value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Totals */}
        <div className="px-5 py-4 border-t space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{t.checkout.items}</span>
            <span className="tabular-nums">{totalItems}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-gray-700">{t.checkout.total}</span>
            <span className="text-2xl font-bold tabular-nums">{formatMXN(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0 || isSubmitting}
            className="w-full h-11 text-sm font-semibold"
          >
            {isSubmitting ? t.checkout.confirming : t.checkout.confirm}
          </Button>
          <Button
            variant="outline"
            onClick={() => { clearCart(); refocusBarcode() }}
            disabled={items.length === 0}
            className="w-full h-9 text-sm"
          >
            {t.checkout.clear}
          </Button>
        </div>

        <div className="px-5 pb-4 text-center">
          <Badge variant="secondary" className="text-xs">
            {t.paymentMethods[paymentMethod]}
          </Badge>
        </div>
      </div>
    </div>
  )
}
