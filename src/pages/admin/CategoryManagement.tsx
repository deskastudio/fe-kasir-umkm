import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Tag, Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  nama: string
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [form, setForm] = useState({ nama: '' })

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories()
      setCategories(extractData(res))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const resetForm = () => setForm({ nama: '' })

  const handleSave = async () => {
    if (!form.nama.trim()) {
      toast.error('Nama kategori harus diisi')
      return
    }
    setSaving(true)
    try {
      if (editCategory) {
        await api.updateCategory(editCategory.id, form.nama)
        toast.success('Kategori berhasil diupdate')
      } else {
        await api.createCategory(form.nama)
        toast.success('Kategori berhasil ditambahkan')
      }
      setDialogOpen(false)
      setEditCategory(null)
      resetForm()
      fetchCategories()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (cat: Category) => {
    setEditCategory(cat)
    setForm({ nama: cat.nama })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.deleteCategory(deleteId)
      toast.success('Kategori berhasil dihapus')
      setDeleteId(null)
      fetchCategories()
    } catch (e: any) {
      toast.error(e.message)
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
            <Tag className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Kelola Kategori</h1>
        </div>
        <Button onClick={() => { resetForm(); setEditCategory(null); setDialogOpen(true) }} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
          <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <Card className="border-[#E9E3DF]">
        <CardHeader>
          <CardTitle className="text-black">Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-[#465C88] py-8">Belum ada kategori</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#E9E3DF]">
                  <Badge className="bg-[#465C88] text-white">{cat.nama}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="h-7 w-7 text-[#465C88] hover:text-[#FF7A30]">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)} className="h-7 w-7 text-red-500 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#E9E3DF]">
          <DialogHeader>
            <DialogTitle className="text-black">{editCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input value={form.nama} onChange={(e) => setForm({ nama: e.target.value })} placeholder="Contoh: Makanan, Minuman" className="border-[#E9E3DF]" />
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
            <AlertDialogTitle className="text-black">Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>Kategori yang digunakan oleh produk tidak dapat dihapus.</AlertDialogDescription>
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
