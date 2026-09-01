import { useEffect, useState } from 'react'
import { productsApi } from '@/api/products'
import { formatMXN } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {CheckCircle, Plus, Search} from 'lucide-react'
import { es } from '@/i18n/es'
import type { Product, Category } from '@/types'
import { ProductFormModal } from './ProductFormModal'
import { CreateCategoryModal } from '@/components/categories/CreateCategoryModal'



const t = es.products

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [loading, setLoading] = useState(true)
  const [showCategoryModal,setShowCategoryModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  async function loadData() {
    setLoading(true)
    const [prods, cats] = await Promise.all([
      productsApi.getAll(search || undefined, selectedCategory),
      productsApi.getCategories(),
    ])
    setProducts(prods)
    setCategories(cats)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [search, selectedCategory])

  function openCreate() {
    setEditingProduct(undefined)
    setShowModal(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setShowModal(true)
  }

  async function handleSaved() {
    setShowModal(false)
    await loadData()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCategoryModal(true)}>
            <Plus size={15} />
            Categoría
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus size={15} />
            {t.newButton}
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          value={selectedCategory ?? ''}
          onChange={(e) => setSelectedCategory(e.target.value || undefined)}
        >
          <option value="">{t.allCategories}</option>
          {categories.map((c) => (
            <option key={c.category_key} value={c.category_key}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">{t.loading}</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">{t.table.name}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">{t.table.barcode}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">{t.table.category}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">{t.table.price}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">{t.table.cost}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_key} className="border-b last:border-0 hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{product.barcode}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{product.category?.name}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMXN(product.price)}</td>
                  <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{formatMXN(product.cost)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                      {t.editButton}
                    </Button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    {t.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          categories={categories}
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
      {showCategoryModal && (
          <CreateCategoryModal
              isOpen={showCategoryModal}
              onClose={() => setShowCategoryModal(false)}
              onCategoryCreated={() => {
                loadData()
                showToast('Categoría creada exitosamente')
              }}
          />
      )}
      {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-xl transition-all">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
      )}
    </div>
  )
}
