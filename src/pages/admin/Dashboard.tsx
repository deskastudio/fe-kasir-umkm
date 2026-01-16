import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { products, transactions, categories, getCategoryName } from '@/data'
import { formatRupiah } from '@/lib/utils'
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function AdminDashboard() {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
  const totalProducts = products.length
  const totalTransactions = transactions.length
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  const salesByCategory = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id).map(p => p.id)
    const sales = transactions.flatMap(t => t.items)
      .filter(item => catProducts.includes(item.productId))
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { name: cat.name, value: sales }
  }).filter(c => c.value > 0)

  const productSales = transactions.flatMap(t => t.items).reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(productSales)
    .map(([id, qty]) => {
      const product = products.find(p => p.id === id)
      return { name: product?.name || 'Unknown', qty, revenue: (product?.price || 0) * qty }
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  // Group transactions by day of week
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const revenueByDay = transactions.reduce((acc, t) => {
    const day = dayNames[new Date(t.createdAt).getDay()]
    acc[day] = (acc[day] || 0) + t.total
    return acc
  }, {} as Record<string, number>)
  const dailyRevenue = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => ({
    day,
    revenue: revenueByDay[day] || 0
  }))

  const lowStock = products.filter(p => p.stock < 10).slice(0, 5)

  const COLORS = ['#FF7A30', '#465C88', '#E9E3DF', '#000000']

  const stats = [
    { title: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Total Transaksi', value: totalTransactions, icon: ShoppingCart, bg: 'bg-[#465C88]' },
    { title: 'Rata-rata Transaksi', value: formatRupiah(avgTransaction), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Total Produk', value: totalProducts, icon: Package, bg: 'bg-[#465C88]' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-[#E9E3DF]">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="text-black">Pendapatan Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DF" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Line type="monotone" dataKey="revenue" stroke="#FF7A30" strokeWidth={2} dot={{ fill: '#FF7A30' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="text-black">Penjualan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="text-black">Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DF" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                <Tooltip />
                <Bar dataKey="qty" fill="#465C88" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertTriangle className="h-4 w-4 text-[#FF7A30]" />
              Stok Menipis (&lt;10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-[#465C88] text-center py-4">Semua stok aman</p>
              ) : lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#E9E3DF]">
                  <div>
                    <p className="font-medium text-sm text-black">{p.name}</p>
                    <p className="text-xs text-[#465C88]">{getCategoryName(p.categoryId)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-[#FF7A30]/20 text-[#FF7A30]'}`}>{p.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
