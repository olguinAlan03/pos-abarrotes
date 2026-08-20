import { useEffect, useState } from 'react'
import { salesApi } from '@/api/sales'
import { formatMXN } from '@/lib/currency'
import { es } from '@/i18n/es'
import type { Sale } from '@/types'

const t = es.sales

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    salesApi.getAll().then((data) => {
      setSales(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">{t.title}</h1>

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">{t.loading}</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">{t.table.id}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">{t.table.date}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">{t.table.payment}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">{t.table.total}</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.sale_key} className="border-b last:border-0 hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{sale.sale_key.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(sale.created_at).toLocaleString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.paymentLabels[sale.payment_method]}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatMXN(sale.total)}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                    {t.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
