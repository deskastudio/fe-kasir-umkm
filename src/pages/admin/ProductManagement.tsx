import { useState } from 'react'
import { products as initialProducts, categories, getCategoryName } from '@/data'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/utils'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', categoryId: '', sku: '' })

  const resetForm = () => setForm({ name: '', price: '', stock: '', categoryId: '', sku: '' })

  const handleSave = () => {
    if (!form.name || !form.price || !form.categoryId || !form.sku) {
      toast.error('Semua field harus diisi')
      return
    }
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...p, name: form.name, price: Number(form.price), stock: Number(form.stock), categoryId: form.categoryId, sku: form.sku } : p))
      toast.success('Produk berhasil diupdate')
    } else {
      const newProduct: Product = { id: `prd-${Date.now()}`, name: form.name, price: Number(form.price), stock: Number(form.stock) || 0, categoryId: form.categoryId, sku: form.sku, createdAt: new Date().toISOString() }
      setProducts([...products, newProduct])
      toast.success('Produk berhasil ditambahkan')
    }
    setDialogOpen(false)
    setEditProduct(null)
    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setForm({ name: product.name, price: String(product.price), stock: String(product.stock), categoryId: product.categoryId, sku: product.sku })
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (deleteId) {
      setProducts(products.filter(p => p.id !== deleteId))
      toast.success('Produk berhasil dihapus')
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF7A30] rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Kelola Produk</h1>
        </div>
        <Button onClick={() => { resetForm(); setEditProduct(null); setDialogOpen(true) }} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
          <Plus className="mr-2 h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>SKU</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-center">Stok</TableHead>
            <TableHead className="text-center w-28">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-[#465C88]">Belum ada data produk</TableCell>
            </TableRow>
          ) : products.map((product, i) => (
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
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 text-[#465C88] hover:text-[#FF7A30] hover:bg-[#FF7A30]/10">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(product.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#E9E3DF]">
          <DialogHeader>
            <DialogTitle className="text-black">{editProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>Nama Produk</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger className="border-[#E9E3DF]"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border-[#E9E3DF]" />
              </div>
              <div className="space-y-2">
                <Label>Stok Awal</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border-[#E9E3DF]" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#E9E3DF]">Batal</Button>
            <Button onClick={handleSave} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-[#E9E3DF]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E9E3DF]">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
