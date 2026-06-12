import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { es } from '@/i18n/es'

const t = es.login

const schema = z.object({
  username: z.string().min(1, t.validation.usernameRequired),
  password: z.string().min(6, t.validation.passwordMin),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setError('')
    try {
      const { user, accessToken } = await authApi.login(values.username, values.password)
      // Persist auth state before navigating — Zustand persist middleware
      // writes to localStorage synchronously on set(), so the token is
      // available in localStorage before the router renders ProtectedRoute.
      setAuth(user, accessToken)
      navigate('/pos', { replace: true })
    } catch (err: unknown) {
      console.error('[Login] authentication failed:', err)
      const status = (err as any)?.response?.status
      if (status === 401) {
        setError(t.error)
      } else if (status >= 500) {
        setError('Error del servidor. Intenta de nuevo más tarde.')
      } else {
        setError(t.error)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm p-8 space-y-6 shadow-lg">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">{t.username}</Label>
            <Input id="username" {...register('username')} autoFocus />
            {errors.username && (
              <p className="text-red-500 text-xs">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t.password}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </form>
      </Card>
    </div>
  )
}
