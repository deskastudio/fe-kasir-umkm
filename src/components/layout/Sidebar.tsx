import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText, BarChart3, History, ClipboardList, Store, Tag
} from 'lucide-react'

const adminMenu = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Kelola User' },
  { to: '/admin/products', icon: Package, label: 'Kelola Produk' },
  { to: '/admin/categories', icon: Tag, label: 'Kategori' },
  { to: '/admin/stock', icon: ClipboardList, label: 'Kelola Stok' },
  { to: '/admin/transactions', icon: FileText, label: 'Daftar Transaksi' },
  { to: '/admin/reports', icon: BarChart3, label: 'Laporan' },
]

const kasirMenu = [
  { to: '/kasir', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kasir/transaction', icon: ShoppingCart, label: 'Transaksi' },
  { to: '/kasir/products', icon: Package, label: 'Daftar Produk' },
  { to: '/kasir/history', icon: History, label: 'Riwayat Transaksi' },
]

export function Sidebar() {
  const { user } = useAuth()
  const menu = user?.role === 'admin' ? adminMenu : kasirMenu

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white">
      <div className="p-5 border-b bg-[#465C88]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">POS UMKM</h1>
            <p className="text-xs text-white/70">Sistem Kasir</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/kasir'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#FF7A30] text-white'
                    : 'text-black hover:bg-[#E9E3DF]'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-[#E9E3DF]">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-[#465C88] flex items-center justify-center text-white text-xs font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-black">{user?.name}</p>
            <p className="text-xs text-[#465C88] capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
