import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatRupiah, formatDate } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, DollarSign, FileDown, FileText, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'

interface TopProduct { productName: string; quantitySold: number; revenue: number }
interface LowStock { id: number; name: string; stock: number }
interface Transaction { id: number; dibuatPada: string; kasir: { nama: string }; itemPenjualan: any[]; total: number }
interface SalesSummary { totalRevenue: number; totalTransactions: number; averageTransaction: number }

export default function ReportsPage() {
  const [summary, setSummary] = useState<SalesSummary>({ totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 })
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
        
        const summaryData = extractData(summaryRes)
        const transactionsData = extractData(trxRes) || []
        
        console.log('Summary data:', summaryData)
        console.log('Transactions data:', transactionsData)
        
        // Fallback: hitung manual jika summary kosong tapi ada transaksi
        if (summaryData && (summaryData.totalRevenue > 0 || summaryData.totalTransactions > 0)) {
          setSummary(summaryData)
        } else if (transactionsData.length > 0) {
          // Hitung manual dari transaksi
          const totalRevenue = transactionsData.reduce((sum: number, t: any) => sum + Number(t.total || 0), 0)
          const totalTransactions = transactionsData.length
          const averageTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0
          setSummary({ totalRevenue, totalTransactions, averageTransaction })
        } else {
          setSummary({ totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 })
        }
        
        setTopProducts(extractData(topRes) || [])
        setLowStock(extractData(lowRes) || [])
        setTransactions(transactionsData)
      } catch (err) {
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const exportCSV = () => {
    const today = new Date().toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    let csv = 'LAPORAN PENJUALAN POS UMKM\n'
    csv += `Tanggal Export: ${today}\n`
    csv += '='.repeat(60) + '\n\n'
    
    csv += 'RINGKASAN PENJUALAN\n'
    csv += `Total Pendapatan,Rp ${summary.totalRevenue.toLocaleString('id-ID')}\n`
    csv += `Total Transaksi,${summary.totalTransactions}\n`
    csv += `Rata-rata per Transaksi,Rp ${summary.averageTransaction.toLocaleString('id-ID')}\n\n`
    
    csv += 'PRODUK TERLARIS\n'
    csv += 'No,Nama Produk,Qty Terjual,Total Pendapatan\n'
    topProducts.forEach((p, i) => {
      csv += `${i + 1},${p.productName},${p.quantitySold},Rp ${p.revenue.toLocaleString('id-ID')}\n`
    })
    
    csv += '\nSTOK MENIPIS (< 10)\n'
    csv += 'No,Nama Produk,Stok\n'
    if (lowStock.length === 0) {
      csv += '-,Tidak ada produk dengan stok menipis,-\n'
    } else {
      lowStock.forEach((p, i) => {
        csv += `${i + 1},${p.name},${p.stock}\n`
      })
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportPDF = () => {
    const today = new Date().toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Penjualan</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #465C88; padding-bottom: 20px; }
          .header h1 { color: #465C88; margin: 0; font-size: 24px; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #465C88; font-size: 18px; border-bottom: 2px solid #FF7A30; padding-bottom: 8px; margin-bottom: 15px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #FF7A30; }
          .summary-card .label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .summary-card .value { font-size: 20px; font-weight: bold; color: #465C88; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #465C88; color: white; padding: 12px; text-align: left; font-size: 14px; }
          td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
          .warning { color: #dc2626; font-weight: bold; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN PENJUALAN</h1>
          <h2 style="margin: 5px 0; color: #FF7A30;">POS UMKM</h2>
          <p>Tanggal Export: ${today}</p>
        </div>

        <div class="section">
          <h2>Ringkasan Penjualan</h2>
          <div class="summary">
            <div class="summary-card">
              <div class="label">Total Pendapatan</div>
              <div class="value">Rp ${summary.totalRevenue.toLocaleString('id-ID')}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Transaksi</div>
              <div class="value">${summary.totalTransactions}</div>
            </div>
            <div class="summary-card">
              <div class="label">Rata-rata Transaksi</div>
              <div class="value">Rp ${summary.averageTransaction.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Produk Terlaris</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th>Nama Produk</th>
                <th class="text-center" style="width: 120px;">Qty Terjual</th>
                <th class="text-right" style="width: 150px;">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.map((p, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td>${p.productName}</td>
                  <td class="text-center">${p.quantitySold}</td>
                  <td class="text-right">Rp ${p.revenue.toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Stok Menipis (&lt; 10)</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th>Nama Produk</th>
                <th class="text-center" style="width: 100px;">Stok</th>
              </tr>
            </thead>
            <tbody>
              ${lowStock.length === 0 ? `
                <tr><td colspan="3" class="text-center">Tidak ada produk dengan stok menipis</td></tr>
              ` : lowStock.map((p, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td>${p.name}</td>
                  <td class="text-center"><span class="warning">${p.stock}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Dokumen ini digenerate otomatis oleh sistem POS UMKM</p>
          <p>© ${new Date().getFullYear()} POS UMKM - All Rights Reserved</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Laporan</h1>
        <div className="flex gap-2">
          <Button onClick={exportCSV} className="bg-[#465C88] hover:bg-[#3a4d6f] text-white">
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={exportPDF} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
            <FileText className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
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
          <CardContent><div className="text-2xl font-bold text-[#FF7A30]">{formatRupiah(summary.averageTransaction)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E9E3DF]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-black"><Package className="h-4 w-4 text-[#FF7A30]" /> Produk Terlaris</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="hover:bg-[#465C88]"><TableHead>Produk</TableHead><TableHead className="text-right">Terjual</TableHead><TableHead className="text-right">Pendapatan</TableHead></TableRow></TableHeader>
              <TableBody>
                {topProducts.slice(0, 5).map((p, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="text-black">{p.productName}</TableCell>
                    <TableCell className="text-right font-medium text-black">{p.quantitySold}</TableCell>
                    <TableCell className="text-right font-medium text-[#FF7A30]">{formatRupiah(p.revenue)}</TableCell>
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
              <TableHeader><TableRow className="hover:bg-[#465C88]"><TableHead>Produk</TableHead><TableHead className="text-right">Stok</TableHead></TableRow></TableHeader>
              <TableBody>
                {lowStock.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center text-[#465C88]">Tidak ada</TableCell></TableRow>
                ) : lowStock.map((p, i) => (
                  <TableRow key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
            <TableHeader><TableRow className="hover:bg-[#465C88]"><TableHead>ID</TableHead><TableHead>Tanggal</TableHead><TableHead>Kasir</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {transactions.map((trx, i) => (
                <TableRow key={trx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="font-mono text-sm text-black">#{trx.id}</TableCell>
                  <TableCell className="text-black">{formatDate(trx.dibuatPada)}</TableCell>
                  <TableCell className="text-black">{trx.kasir?.nama || '-'}</TableCell>
                  <TableCell className="text-black">{trx.itemPenjualan?.length || 0} item</TableCell>
                  <TableCell className="text-right font-medium text-[#FF7A30]">{formatRupiah(trx.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
