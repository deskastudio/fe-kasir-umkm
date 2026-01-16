import { transactions } from '@/data'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

export default function TransactionList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FF7A30] rounded-lg">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Daftar Transaksi</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>ID Transaksi</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Kasir</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Bayar</TableHead>
            <TableHead className="text-right">Kembali</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[#465C88]">Belum ada transaksi</TableCell>
            </TableRow>
          ) : transactions.map((trx, i) => (
            <TableRow key={trx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-mono text-sm text-[#465C88]">{trx.id}</TableCell>
              <TableCell className="text-black">{formatDate(trx.createdAt)}</TableCell>
              <TableCell className="text-black">{trx.cashierName}</TableCell>
              <TableCell className="text-center">
                <Badge className="bg-[#465C88]">{trx.items.length} item</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-[#FF7A30]">{formatRupiah(trx.total)}</TableCell>
              <TableCell className="text-right text-black">{formatRupiah(trx.payment)}</TableCell>
              <TableCell className="text-right text-[#465C88]">{formatRupiah(trx.change)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
