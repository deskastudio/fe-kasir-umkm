import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatRupiah, formatDate } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, DollarSign, FileDown, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'

interface TopProduct { name: string; totalQty: number; totalRevenue: number }
interface LowStock { id: number; name: string; stock: number }
interface Transaction { id: number; createdAt: string; user: { name: string }; items: { quantity: number }[]; totalAmount: number }
interface SalesSummary { totalRevenue: number; totalTransactions: number; avgTransaction: number }

export default function ReportsPage() {
  const [summary, setSummary] = useState<SalesSummary>({ totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 })
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStock, setLowStock] = useState<LowStock[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const [summaryRes, topRes, lowRes, trxRes] = await Promise.all([
          api.getSalesSummary('2020-01-01', today),
          api.getTopProducts({ limit: 10 }),
          api.getLowStock(10),
          api.getTransactions({ batas: 20 })
        ])
        setSummary(extractData(summaryRes) || { totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 })
        setTopProducts(extractData(topRes) || [])
        setLowStock(extractData(lowRes) || [])
        setTransactions(extractData(trxRes) || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const exportCSV = async () => {
    // Generate CSV from current data
    let csv = 'LAPORAN POS UMKM\n'
    csv += `Tanggal Export: ${new Date().toLocaleString('id-ID')}\n\n`
    csv += `Total Pendapatan,${summary.totalRevenue}\n`
    csv += `Total Transaksi,${summary.totalTransactions}\n\n`
    csv += 'PRODUK TERLARIS\nNama,Qty,Pendapatan\n'
    csv += topProducts.map(p => `${p.name},${p.totalQty},${p.totalRevenue}`).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `laporan-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Laporan</h1>
        <Button onClick={exportCSV} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
          <FileDown className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E9E3DF]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#465C88]">Total Pendapatan</CardTitle>
            <div className="p-2 rounded-lg bg-[#FF7A30]"><TrendingUp className="h-4 w-4 text-white" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-[#FF7A30]">{formatRupiah(summary.totalRevenue)}</div></CardContent>
        </Card>
        <Card className="border-[#E9E3DF]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#465C88]">Total Transaksi</CardTitle>
            <div className="p-2 rounded-lg bg-[#465C88]"><ShoppingCart className="h-4 w-4 text-white" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-black">{summary.totalTransactions}</div></CardContent>
        </Card>
        <Card className="border-[#E9E3DF]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#465C88]">Rata-rata Transaksi</CardTitle>
            <div className="p-2 rounded-lg bg-[#FF7A30]"><DollarSign className="h-4 w-4 text-white" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-[#FF7A30]">{formatRupiah(summary.avgTransaction)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E9E3DF]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-black"><Package className="h-4 w-4 text-[#FF7A30]" /> Produk Terlaris</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-[#E9E3DF]"><TableHead className="text-[#465C88]">Produk</TableHead><TableHead className="text-right text-[#465C88]">Terjual</TableHead><TableHead className="text-right text-[#465C88]">Pendapatan</TableHead></TableRow></TableHeader>
              <TableBody>
                {topProducts.slice(0, 5).map((p, i) => (
                  <TableRow key={i} className="border-[#E9E3DF]">
                    <TableCell className="text-black">{p.name}</TableCell>
                    <TableCell className="text-right font-medium text-black">{p.totalQty}</TableCell>
                    <TableCell className="text-right font-medium text-[#FF7A30]">{formatRupiah(p.totalRevenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-[#E9E3DF]">
          <CardHeader><CardTitle className="text-red-600">⚠ Stok Menipis (&lt;10)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-[#E9E3DF]"><TableHead className="text-[#465C88]">Produk</TableHead><TableHead className="text-right text-[#465C88]">Stok</TableHead></TableRow></TableHeader>
              <TableBody>
                {lowStock.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center text-[#465C88]">Tidak ada</TableCell></TableRow>
                ) : lowStock.map((p) => (
                  <TableRow key={p.id} className="border-[#E9E3DF]">
                    <TableCell className="text-black">{p.name}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">{p.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E9E3DF]">
        <CardHeader><CardTitle className="text-black">Transaksi Terbaru</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow className="border-[#E9E3DF]"><TableHead className="text-[#465C88]">ID</TableHead><TableHead className="text-[#465C88]">Tanggal</TableHead><TableHead className="text-[#465C88]">Kasir</TableHead><TableHead className="text-[#465C88]">Items</TableHead><TableHead className="text-right text-[#465C88]">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {transactions.map((trx) => (
                <TableRow key={trx.id} className="border-[#E9E3DF]">
                  <TableCell className="font-mono text-sm text-black">#{trx.id}</TableCell>
                  <TableCell className="text-black">{formatDate(trx.createdAt)}</TableCell>
                  <TableCell className="text-black">{trx.user?.name || '-'}</TableCell>
                  <TableCell className="text-black">{trx.items?.length || 0} item</TableCell>
                  <TableCell className="text-right font-medium text-[#FF7A30]">{formatRupiah(trx.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
