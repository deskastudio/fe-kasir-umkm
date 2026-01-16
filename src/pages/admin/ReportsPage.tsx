import { transactions, products } from '@/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatRupiah, formatDate } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, DollarSign, FileDown, FileSpreadsheet } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ReportsPage() {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = transactions.length
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  const productSales = transactions.flatMap(t => t.items).reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(productSales)
    .map(([productId, qty]) => {
      const product = products.find(p => p.id === productId)
      return { name: product?.name || 'Unknown', qty, revenue: (product?.price || 0) * qty }
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10)

  const lowStock = products.filter(p => p.stock < 10)

  // Export CSV
  const exportCSV = () => {
    // Transaction Report CSV
    const trxHeaders = ['ID Transaksi', 'Tanggal', 'Kasir', 'Jumlah Item', 'Total', 'Pembayaran', 'Kembalian']
    const trxRows = transactions.map(t => [
      t.id,
      new Date(t.createdAt).toLocaleString('id-ID'),
      t.cashierName,
      t.items.length,
      t.total,
      t.payment,
      t.change
    ])

    let csv = 'LAPORAN TRANSAKSI POS UMKM\n'
    csv += `Tanggal Export: ${new Date().toLocaleString('id-ID')}\n\n`
    csv += `Total Pendapatan: ${formatRupiah(totalRevenue)}\n`
    csv += `Total Transaksi: ${totalTransactions}\n`
    csv += `Rata-rata Transaksi: ${formatRupiah(avgTransaction)}\n\n`
    csv += 'DAFTAR TRANSAKSI\n'
    csv += trxHeaders.join(',') + '\n'
    csv += trxRows.map(row => row.join(',')).join('\n')

    csv += '\n\nPRODUK TERLARIS\n'
    csv += 'Nama Produk,Qty Terjual,Pendapatan\n'
    csv += topProducts.map(p => `${p.name},${p.qty},${p.revenue}`).join('\n')

    csv += '\n\nSTOK MENIPIS\n'
    csv += 'Nama Produk,Stok Tersisa\n'
    csv += lowStock.map(p => `${p.name},${p.stock}`).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `laporan-pos-umkm-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header
    doc.setFillColor(70, 92, 136) // #465C88
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('POS UMKM', 14, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Laporan Penjualan', 14, 30)
    
    doc.setFontSize(10)
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 14, 20, { align: 'right' })

    // Summary Cards
    doc.setTextColor(0, 0, 0)
    let y = 55

    doc.setFillColor(233, 227, 223) // #E9E3DF
    doc.roundedRect(14, y, 55, 30, 3, 3, 'F')
    doc.roundedRect(77, y, 55, 30, 3, 3, 'F')
    doc.roundedRect(140, y, 55, 30, 3, 3, 'F')

    doc.setFontSize(9)
    doc.setTextColor(70, 92, 136)
    doc.text('Total Pendapatan', 18, y + 10)
    doc.text('Total Transaksi', 81, y + 10)
    doc.text('Rata-rata Transaksi', 144, y + 10)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 122, 48) // #FF7A30
    doc.text(formatRupiah(totalRevenue), 18, y + 22)
    doc.setTextColor(0, 0, 0)
    doc.text(String(totalTransactions), 81, y + 22)
    doc.setTextColor(255, 122, 48)
    doc.text(formatRupiah(avgTransaction), 144, y + 22)

    y += 45

    // Transaction Table
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Daftar Transaksi', 14, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['ID', 'Tanggal', 'Kasir', 'Items', 'Total', 'Bayar', 'Kembali']],
      body: transactions.map(t => [
        t.id,
        new Date(t.createdAt).toLocaleDateString('id-ID'),
        t.cashierName,
        t.items.length,
        formatRupiah(t.total),
        formatRupiah(t.payment),
        formatRupiah(t.change)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [70, 92, 136], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 247, 245] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    })

    // New page for products
    doc.addPage()
    
    // Header on new page
    doc.setFillColor(70, 92, 136)
    doc.rect(0, 0, pageWidth, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Laporan Produk', 14, 16)

    y = 40

    // Top Products
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Produk Terlaris', 14, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['No', 'Nama Produk', 'Qty Terjual', 'Pendapatan']],
      body: topProducts.map((p, i) => [i + 1, p.name, p.qty, formatRupiah(p.revenue)]),
      theme: 'grid',
      headStyles: { fillColor: [255, 122, 48], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 247, 245] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 15 }, 2: { halign: 'center' }, 3: { halign: 'right' } },
      margin: { left: 14, right: 14 }
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

    // Low Stock
    if (lowStock.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text('⚠ Stok Menipis (< 10)', 14, y)
      y += 5

      autoTable(doc, {
        startY: y,
        head: [['No', 'Nama Produk', 'SKU', 'Stok Tersisa']],
        body: lowStock.map((p, i) => [i + 1, p.name, p.sku, p.stock]),
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 15 }, 3: { halign: 'center' } },
        margin: { left: 14, right: 14 }
      })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
      doc.text('Dicetak dari POS UMKM', 14, doc.internal.pageSize.getHeight() - 10)
    }

    doc.save(`laporan-pos-umkm-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Laporan</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="border-[#E9E3DF]">
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Export CSV
          </Button>
          <Button onClick={exportPDF} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
            <FileDown className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E9E3DF]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#465C88]">Total Pendapatan</CardTitle>
            <div className="p-2 rounded-lg bg-[#FF7A30]">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-[#FF7A30]">{formatRupiah(totalRevenue)}</div></CardContent>
        </Card>
        <Card className="border-[#E9E3DF]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#465C88]">Total Transaksi</CardTitle>
            <div className="p-2 rounded-lg bg-[#465C88]">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-black">{totalTransactions}</div></CardContent>
        </Card>
        <Card className="border-[#E9E3DF]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#465C88]">Rata-rata Transaksi</CardTitle>
            <div className="p-2 rounded-lg bg-[#FF7A30]">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-[#FF7A30]">{formatRupiah(avgTransaction)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Package className="h-4 w-4 text-[#FF7A30]" /> Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#E9E3DF]">
                  <TableHead className="text-[#465C88]">Produk</TableHead>
                  <TableHead className="text-right text-[#465C88]">Terjual</TableHead>
                  <TableHead className="text-right text-[#465C88]">Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.slice(0, 5).map((p, i) => (
                  <TableRow key={i} className="border-[#E9E3DF]">
                    <TableCell className="text-black">{p.name}</TableCell>
                    <TableCell className="text-right font-medium text-black">{p.qty}</TableCell>
                    <TableCell className="text-right font-medium text-[#FF7A30]">{formatRupiah(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-[#E9E3DF]">
          <CardHeader>
            <CardTitle className="text-red-600">⚠ Stok Menipis (&lt;10)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#E9E3DF]">
                  <TableHead className="text-[#465C88]">Produk</TableHead>
                  <TableHead className="text-right text-[#465C88]">Stok</TableHead>
                </TableRow>
              </TableHeader>
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
        <CardHeader>
          <CardTitle className="text-black">Semua Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E9E3DF]">
                <TableHead className="text-[#465C88]">ID</TableHead>
                <TableHead className="text-[#465C88]">Tanggal</TableHead>
                <TableHead className="text-[#465C88]">Kasir</TableHead>
                <TableHead className="text-[#465C88]">Items</TableHead>
                <TableHead className="text-right text-[#465C88]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((trx) => (
                <TableRow key={trx.id} className="border-[#E9E3DF]">
                  <TableCell className="font-mono text-sm text-black">{trx.id}</TableCell>
                  <TableCell className="text-black">{formatDate(trx.createdAt)}</TableCell>
                  <TableCell className="text-black">{trx.cashierName}</TableCell>
                  <TableCell className="text-black">{trx.items.length} item</TableCell>
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
