import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productsApi } from '@/api/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { es } from '@/i18n/es'
import type { Product, Category } from '@/types'

const t = es.products.form
const v = t.validation

const schema = z.object({
  name: z.string().min(1, v.nameRequired),
  barcode: z.string().min(1, v.barcodeRequired),
  price: z.coerce.number().int().positive(v.pricePositive),
  cost: z.coerce.number().int().min(0, v.costNonNegative),
  stock: z.coerce.number().int().min(0, v.stockNonNegative),
  categoryKey: z.string().uuid(v.categoryRequired),
})

type FormValues = z.infer<typeof schema>

interface Props {
  product?: Product
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export function ProductFormModal({ product, categories, onClose, onSaved }: Props) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          barcode: product.barcode,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          categoryKey: product.category_key,
        }
      : { cost: 0, stock: 0 },
  })

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      await productsApi.update(product.product_key, values)
    } else {
      await productsApi.create(values)
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-bold text-gray-800">
            {isEdit ? t.titleEdit : t.titleCreate}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label>{t.name}</Label>
            <Input {...register('name')} autoFocus />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>{t.barcode}</Label>
            <Input {...register('barcode')} placeholder={t.barcodePlaceholder} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>{t.price}</Label>
              <Input type="number" {...register('price')} />
              {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t.cost}</Label>
              <Input type="number" {...register('cost')} />
              {errors.cost && <p className="text-red-500 text-xs">{errors.cost.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t.stock}</Label>
              <Input type="number" {...register('stock')} />
              {errors.stock && <p className="text-red-500 text-xs">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t.category}</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              {...register('categoryKey')}
            >
              <option value="">{t.categoryPlaceholder}</option>
              {categories.map((c) => (
                <option key={c.category_key} value={c.category_key}>{c.name}</option>
              ))}
            </select>
            {errors.categoryKey && (
              <p className="text-red-500 text-xs">{errors.categoryKey.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
