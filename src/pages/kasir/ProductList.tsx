import { products, getCategoryName } from '@/data'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { Package } from 'lucide-react'

export default function ProductList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FF7A30] rounded-lg">
          <Package className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Daftar Produk</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>SKU</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-center">Stok</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, i) => (
            <TableRow key={product.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-mono text-sm text-[#465C88]">{product.sku}</TableCell>
              <TableCell className="font-medium text-black">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-[#465C88] text-[#465C88]">{getCategoryName(product.categoryId)}</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-[#FF7A30]">{formatRupiah(product.price)}</TableCell>
              <TableCell className="text-center">
                <Badge className={product.stock < 10 ? 'bg-red-500' : 'bg-[#465C88]'}>{product.stock}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
