import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { Package, Loader2 } from 'lucide-react'

interface Product {
  id: string
  kode: string
  nama: string
  kategori: string | null
  harga: number
  stok: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProducts({ batas: 100, aktif: true }).then(res => {
      setProducts(extractData(res))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

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
            <TableHead>Kode</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-center">Stok</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-[#465C88]">Belum ada produk</TableCell>
            </TableRow>
          ) : products.map((product, i) => (
            <TableRow key={product.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-mono text-sm text-[#465C88]">{product.kode}</TableCell>
              <TableCell className="font-medium text-black">{product.nama}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-[#465C88] text-[#465C88]">{product.kategori || '-'}</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-[#FF7A30]">{formatRupiah(product.harga)}</TableCell>
              <TableCell className="text-center">
                <Badge className={product.stok < 10 ? 'bg-red-500' : 'bg-[#465C88]'}>{product.stok}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
