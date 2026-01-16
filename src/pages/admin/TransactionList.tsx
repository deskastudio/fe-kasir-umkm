import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { Receipt, Loader2 } from 'lucide-react'

interface Transaction {
  id: string
  noFaktur: string
  total: number
  jumlahBayar: number
  jumlahKembalian: number
  dibuatPada: string
  kasir: { nama: string }
  itemPenjualan: any[]
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTransactions({ batas: 100 }).then(res => {
      setTransactions(extractData(res))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FF7A30] rounded-lg">
          <Receipt className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Daftar Transaksi</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>No. Faktur</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Kasir</TableHead>
            <TableHead>Jumlah Item</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Bayar</TableHead>
            <TableHead className="text-right">Kembalian</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[#465C88]">Belum ada transaksi</TableCell>
            </TableRow>
          ) : transactions.map((trx, i) => (
            <TableRow key={trx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-mono text-sm text-[#465C88]">{trx.noFaktur}</TableCell>
              <TableCell className="text-black">{new Date(trx.dibuatPada).toLocaleString('id-ID')}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-[#465C88] text-[#465C88]">{trx.kasir?.nama || '-'}</Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-[#465C88]">{trx.itemPenjualan?.length || 0} item</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-[#FF7A30]">{formatRupiah(trx.total)}</TableCell>
              <TableCell className="text-right text-black">{formatRupiah(trx.jumlahBayar)}</TableCell>
              <TableCell className="text-right text-green-600">{formatRupiah(trx.jumlahKembalian)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
