import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'
import { ShoppingCart, Package, TrendingUp, Loader2, History } from 'lucide-react'

export default function KasirDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalTransactions: 0, totalRevenue: 0, totalProducts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getTransactions({ batas: 1000 }),
      api.getProducts({ batas: 1000, aktif: true })
    ]).then(([trxRes, prodRes]) => {
      const transactions = extractData(trxRes) as any[] || []
      const products = extractData(prodRes) as any[] || []
      
      // Filter transaksi kasir ini saja
      const myTransactions = transactions.filter((t: any) => t.idKasir === user?.id)
      
      setStats({
        totalTransactions: myTransactions.length,
        totalRevenue: myTransactions.reduce((sum: number, t: any) => sum + Number(t.total || t.totalAmount || 0), 0),
        totalProducts: products.length
      })
    }).finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

  const avgTransaction = stats.totalTransactions > 0 ? stats.totalRevenue / stats.totalTransactions : 0

  const statCards = [
    { title: 'Total Transaksi Hari Ini', value: stats.totalTransactions, icon: ShoppingCart, bg: 'bg-[#465C88]' },
    { title: 'Total Pendapatan', value: formatRupiah(stats.totalRevenue), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Rata-rata Transaksi', value: formatRupiah(avgTransaction), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Produk Tersedia', value: stats.totalProducts, icon: Package, bg: 'bg-[#465C88]' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Selamat Datang, {user?.name}!</h1>
        <p className="text-[#465C88]">Berikut ringkasan aktivitas Anda hari ini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-[#E9E3DF]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#465C88]">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#E9E3DF]">
        <CardHeader>
          <CardTitle className="text-black">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/kasir/transaction" className="p-4 bg-[#FF7A30] text-white rounded-lg hover:bg-[#e86a20] transition-colors text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Transaksi Baru</p>
          </Link>
          <Link to="/kasir/products" className="p-4 bg-[#465C88] text-white rounded-lg hover:bg-[#3a4d6f] transition-colors text-center">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Lihat Produk</p>
          </Link>
          <Link to="/kasir/history" className="p-4 bg-[#465C88] text-white rounded-lg hover:bg-[#3a4d6f] transition-colors text-center">
            <History className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Riwayat Transaksi</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
