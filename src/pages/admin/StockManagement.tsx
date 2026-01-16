import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  kode: string
  nama: string
  stok: number
}

export default function StockManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ idProduk: '', tipe: 'MASUK', jumlah: '', catatan: '' })

  const fetchData = async () => {
    try {
      const [prodRes, adjRes] = await Promise.all([
        api.getProducts({ batas: 100 }),
        api.getStockAdjustments({ batas: 50 })
      ])
      setProducts(extractData(prodRes))
      setAdjustments(extractData(adjRes))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => setForm({ idProduk: '', tipe: 'MASUK', jumlah: '', catatan: '' })

  const handleSave = async () => {
    if (!form.idProduk || !form.jumlah) {
      toast.error('Produk dan jumlah harus diisi')
      return
    }
    setSaving(true)
    try {
      await api.createStockAdjustment({
        idProduk: form.idProduk,
        tipe: form.tipe,
        jumlah: Number(form.jumlah),
        catatan: form.catatan || null
      })
      toast.success('Penyesuaian stok berhasil')
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#465C88] rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Kelola Stok</h1>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
          <Plus className="mr-2 h-4 w-4" /> Penyesuaian Stok
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-black">Stok Produk</h2>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#465C88]">
                <TableHead>Kode</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="text-center">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p, i) => (
                <TableRow key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="font-mono text-sm text-[#465C88]">{p.kode}</TableCell>
                  <TableCell className="font-medium text-black">{p.nama}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={p.stok < 10 ? 'bg-red-500' : 'bg-[#465C88]'}>{p.stok}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-black">Riwayat Penyesuaian</h2>
          <div className="space-y-2">
            {adjustments.length === 0 ? (
              <p className="text-center text-[#465C88] py-8">Belum ada riwayat</p>
            ) : adjustments.map((adj: any) => (
              <div key={adj.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-black">{adj.produk?.nama}</p>
                  <Badge className={adj.tipe === 'MASUK' ? 'bg-green-500' : 'bg-red-500'}>
                    {adj.tipe === 'MASUK' ? <Plus className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                    {adj.jumlah}
                  </Badge>
                </div>
                <p className="text-xs text-[#465C88]">{new Date(adj.dibuatPada).toLocaleString('id-ID')}</p>
                {adj.catatan && <p className="text-sm text-[#465C88] mt-1">{adj.catatan}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#E9E3DF]">
          <DialogHeader>
            <DialogTitle className="text-black">Penyesuaian Stok</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produk</Label>
              <Select value={form.idProduk} onValueChange={(v) => setForm({ ...form, idProduk: v })}>
                <SelectTrigger className="border-[#E9E3DF]"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={form.tipe} onValueChange={(v) => setForm({ ...form, tipe: v })}>
                <SelectTrigger className="border-[#E9E3DF]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASUK">Stok Masuk (+)</SelectItem>
                  <SelectItem value="KELUAR">Stok Keluar (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Alasan penyesuaian" className="border-[#E9E3DF]" />
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
    </div>
  )
}
