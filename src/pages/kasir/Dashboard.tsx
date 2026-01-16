import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { transactions } from '@/data'
import { useAuth } from '@/contexts/AuthContext'
import { formatRupiah } from '@/lib/utils'
import { ShoppingCart, TrendingUp, Clock, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function KasirDashboard() {
  const { user } = useAuth()
  const myTransactions = transactions.filter(t => t.cashierId === user?.id)
  const todayRevenue = myTransactions.reduce((sum, t) => sum + t.total, 0)
  const avgTransaction = myTransactions.length > 0 ? todayRevenue / myTransactions.length : 0
  const totalItems = myTransactions.flatMap(t => t.items).reduce((sum, i) => sum + i.quantity, 0)

  const hourlyData = [
    { hour: '08:00', trx: 2, revenue: 45000 },
    { hour: '09:00', trx: 3, revenue: 67000 },
    { hour: '10:00', trx: 5, revenue: 125000 },
    { hour: '11:00', trx: 4, revenue: 98000 },
    { hour: '12:00', trx: 7, revenue: 185000 },
    { hour: '13:00', trx: 6, revenue: 156000 },
    { hour: '14:00', trx: 4, revenue: 112000 },
    { hour: '15:00', trx: 3, revenue: 78000 },
  ]

  const recentTrx = myTransactions.slice(0, 5)

  const stats = [
    { title: 'Transaksi Hari Ini', value: myTransactions.length, icon: ShoppingCart, bg: 'bg-[#465C88]' },
    { title: 'Pendapatan Hari Ini', value: formatRupiah(todayRevenue), icon: TrendingUp, bg: 'bg-[#FF7A30]' },
    { title: 'Rata-rata Transaksi', value: formatRupiah(avgTransaction), icon: Target, bg: 'bg-[#465C88]' },
    { title: 'Item Terjual', value: totalItems, icon: Clock, bg: 'bg-[#FF7A30]' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Halo, {user?.name}!</h1>
        <div className="text-right text-sm text-[#465C88]">
          <p>Shift Pagi</p>
          <p className="font-medium text-black">08:00 - 16:00</p>
        </div>
      </div>

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
            <CardTitle className="text-black">Pendapatan per Jam</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DF" />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#FF7A30" fill="#FF7A30" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="text-black">Jumlah Transaksi per Jam</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DF" />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="trx" fill="#465C88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E9E3DF]">
        <CardHeader>
          <CardTitle className="text-black">Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrx.length === 0 ? (
            <p className="text-center text-[#465C88] py-8">Belum ada transaksi hari ini</p>
          ) : (
            <div className="space-y-2">
              {recentTrx.map(trx => (
                <div key={trx.id} className="flex items-center justify-between p-3 rounded-lg bg-[#E9E3DF]">
                  <div>
                    <p className="font-medium text-sm text-black">{trx.id}</p>
                    <p className="text-xs text-[#465C88]">{trx.items.length} item</p>
                  </div>
                  <p className="font-bold text-black">{formatRupiah(trx.total)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
