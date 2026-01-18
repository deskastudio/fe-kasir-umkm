import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'
import { Package, ShoppingCart, TrendingUp, Loader2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalTransactions: 0, totalRevenue: 0 })
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getProducts({ batas: 1000 }),
      api.getTransactions({ batas: 1000 }),
      api.getTopProducts({ limit: 5 }),
      api.getLowStock(10)
    ]).then(([prodRes, trxRes, topRes, lowRes]) => {
      const products = extractData(prodRes) as any[] || []
      const transactions = extractData(trxRes) as any[] || []
      
      setStats({
        totalProducts: products.length,
        totalTransactions: transactions.length,
        totalRevenue: transactions.reduce((sum: number, t: any) => sum + Number(t.total || t.totalAmount || 0), 0)
      })
      
      setTopProducts(extractData(topRes) || [])
      setLowStock(extractData(lowRes) || [])
    }).catch(err => {
      console.error(err)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

  const avgTransaction = stats.totalTransactions > 0 ? stats.totalRevenue / stats.totalTransactions : 0

  const statCards = [
    { title: 'Total Pendapatan', value: formatRupiah(stats.totalRevenue), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Total Transaksi', value: stats.totalTransactions, icon: ShoppingCart, bg: 'bg-[#465C88]' },
    { title: 'Rata-rata Transaksi', value: formatRupiah(avgTransaction), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Total Produk', value: stats.totalProducts, icon: Package, bg: 'bg-[#465C88]' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="text-black">Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-[#465C88] py-4">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.productName || item.nama}</p>
                      <p className="text-sm text-[#465C88]">Terjual: {item.quantitySold || item.totalTerjual} unit</p>
                    </div>
                    <p className="font-bold text-[#FF7A30]">{formatRupiah(item.revenue || item.totalPendapatan)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-center text-[#465C88] py-4">Semua stok aman</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.name || item.nama}</p>
                      <p className="text-sm text-[#465C88]">{item.sku || item.kode}</p>
                    </div>
                    <Badge className="bg-red-500">Stok: {item.stock || item.stok}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
