import { useState } from 'react'
import { products as initialProducts, getCategoryName } from '@/data'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ClipboardList, Plus, Minus } from 'lucide-react'

export default function StockManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [adjustment, setAdjustment] = useState('')

  const handleAdjust = () => {
    const qty = Number(adjustment)
    if (!qty) {
      toast.error('Masukkan jumlah yang valid')
      return
    }
    if (selected) {
      const newStock = selected.stock + qty
      if (newStock < 0) {
        toast.error('Stok tidak boleh negatif')
        return
      }
      setProducts(products.map(p => p.id === selected.id ? { ...p, stock: newStock } : p))
      toast.success(`Stok ${selected.name} berhasil diupdate`)
      setDialogOpen(false)
      setSelected(null)
      setAdjustment('')
    }
  }

  const openDialog = (product: Product) => {
    setSelected(product)
    setAdjustment('')
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#465C88] rounded-lg">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Kelola Stok</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>SKU</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-center">Stok Saat Ini</TableHead>
            <TableHead className="text-center w-32">Aksi</TableHead>
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
              <TableCell className="text-center">
                <Badge className={product.stock < 10 ? 'bg-red-500 text-white' : product.stock < 20 ? 'bg-[#FF7A30] text-white' : 'bg-[#465C88] text-white'}>
                  {product.stock}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button size="sm" onClick={() => openDialog(product)} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
                  <Plus className="h-3 w-3 mr-1" /><Minus className="h-3 w-3 mr-1" /> Adjust
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#E9E3DF]">
          <DialogHeader>
            <DialogTitle className="text-black">Adjust Stok: {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-[#E9E3DF] rounded-lg text-center">
              <p className="text-sm text-[#465C88]">Stok Saat Ini</p>
              <p className="text-3xl font-bold text-black">{selected?.stock}</p>
            </div>
            <div className="space-y-2">
              <Label>Jumlah Penyesuaian (+/-)</Label>
              <Input type="number" placeholder="Contoh: 10 atau -5" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} className="border-[#E9E3DF]" />
              <p className="text-xs text-[#465C88]">Gunakan angka positif untuk menambah, negatif untuk mengurangi</p>
            </div>
            {adjustment && (
              <div className="p-3 bg-[#465C88]/10 rounded-lg">
                <p className="text-sm text-[#465C88]">Stok Setelah Penyesuaian</p>
                <p className="text-xl font-bold text-[#FF7A30]">{(selected?.stock || 0) + Number(adjustment)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#E9E3DF]">Batal</Button>
            <Button onClick={handleAdjust} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
