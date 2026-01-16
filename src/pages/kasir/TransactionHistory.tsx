import { transactions } from '@/data'
import { useAuth } from '@/contexts/AuthContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { History } from 'lucide-react'

export default function TransactionHistory() {
  const { user } = useAuth()
  const myTransactions = transactions.filter(t => t.cashierId === user?.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#465C88] rounded-lg">
          <History className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Riwayat Transaksi</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>ID Transaksi</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Bayar</TableHead>
            <TableHead className="text-right">Kembali</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {myTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-[#465C88]">Belum ada transaksi</TableCell>
            </TableRow>
          ) : myTransactions.map((trx, i) => (
            <TableRow key={trx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-mono text-sm text-[#465C88]">{trx.id}</TableCell>
              <TableCell className="text-black">{formatDate(trx.createdAt)}</TableCell>
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
