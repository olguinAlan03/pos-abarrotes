import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, BarChart2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { es } from '@/i18n/es'

const t = es.nav

const navItems = [
  { to: '/pos', label: t.pos, icon: ShoppingCart, roles: ['admin', 'cashier'] },
  { to: '/products', label: t.products, icon: Package, roles: ['admin'] },
  { to: '/sales', label: t.sales, icon: BarChart2, roles: ['admin', 'cashier'] },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  )

  const roleLabel = user?.role ? t.roles[user.role] : ''

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-gray-700/60">
          <p className="text-base font-bold tracking-tight">{es.app.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{es.app.tagline}</p>
        </div>

        <div className="px-4 py-3 border-b border-gray-700/60">
          <p className="text-sm font-medium text-white truncate">{user?.username}</p>
          <p className="text-xs text-gray-400 mt-0.5">{roleLabel}</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 mt-1">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith(to)
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 gap-2"
          >
            <LogOut size={15} />
            {t.logout}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
