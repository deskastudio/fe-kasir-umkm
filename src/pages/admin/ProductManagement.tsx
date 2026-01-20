import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/utils'

interface Product {
  id: string
  kode: string
  nama: string
  kategori: string | null
  idKategori: string | null
  satuan: string | null
  harga: number
  stok: number
  aktif: boolean
}

interface Category {
  id: string
  nama: string
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ kode: '', nama: '', kategori: '', satuan: '', harga: '', stok: '' })

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts({ batas: 100 })
      setProducts(extractData(res))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories()
      const data = extractData(res)
      console.log('Categories fetched:', data)
      setCategories(data)
    } catch (e: any) {
      console.error('Error fetching categories:', e)
      toast.error('Gagal memuat kategori: ' + e.message)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const resetForm = () => setForm({ kode: '', nama: '', kategori: '', satuan: '', harga: '', stok: '' })

  const handleSave = async () => {
    if (!form.kode || !form.nama || !form.harga) {
      toast.error('Kode, nama, dan harga harus diisi')
      return
    }
    setSaving(true)
    try {
      const data = {
        kode: form.kode,
        nama: form.nama,
        idKategori: form.kategori || null,
        satuan: form.satuan || null,
        harga: Number(form.harga),
        stok: Number(form.stok) || 0,
      }
      if (editProduct) {
        await api.updateProduct(editProduct.id, data)
        toast.success('Produk berhasil diupdate')
      } else {
        await api.createProduct(data)
        toast.success('Produk berhasil ditambahkan')
      }
      setDialogOpen(false)
      setEditProduct(null)
      resetForm()
      fetchProducts()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setForm({
      kode: product.kode,
      nama: product.nama,
      kategori: product.idKategori || '',
      satuan: product.satuan || '',
      harga: String(product.harga),
      stok: String(product.stok),
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.deleteProduct(deleteId)
      toast.success('Produk berhasil dihapus')
      setDeleteId(null)
      fetchProducts()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF7A30] rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-black">Kelola Produk</h1>
        </div>
        <Button onClick={() => { resetForm(); setEditProduct(null); setDialogOpen(true) }} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>Kode</TableHead>
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
              <TableCell className="font-mono text-sm text-[#465C88]">{product.kode}</TableCell>
              <TableCell className="font-medium text-black">{product.nama}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-[#465C88] text-[#465C88]">{product.kategori || '-'}</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-[#FF7A30]">{formatRupiah(product.harga)}</TableCell>
              <TableCell className="text-center">
                <Badge className={product.stok < 10 ? 'bg-red-500' : 'bg-[#465C88]'}>{product.stok}</Badge>
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#E9E3DF] max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">{editProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kode Produk</Label>
              <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="border-[#E9E3DF]" disabled={!!editProduct} />
            </div>
            <div className="space-y-2">
              <Label>Nama Produk</Label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
                  <SelectTrigger className="border-[#E9E3DF]"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Satuan</Label>
                <Input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="pcs, kg, dll" className="border-[#E9E3DF]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga</Label>
                <Input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} className="border-[#E9E3DF]" />
              </div>
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} className="border-[#E9E3DF]" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#E9E3DF]">Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
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
