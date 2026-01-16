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
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  nama: string
  username: string
  role: string
  aktif: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({ username: '', nama: '', kataSandi: '', role: 'KASIR' })

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers()
      setUsers(extractData(res))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const resetForm = () => setForm({ username: '', nama: '', kataSandi: '', role: 'KASIR' })

  const handleSave = async () => {
    if (!form.username || !form.nama) {
      toast.error('Username dan nama harus diisi')
      return
    }
    if (!editUser && !form.kataSandi) {
      toast.error('Password harus diisi')
      return
    }
    setSaving(true)
    try {
      const data: any = {
        username: form.username,
        nama: form.nama,
        role: form.role,
      }
      if (form.kataSandi) data.kataSandi = form.kataSandi

      if (editUser) {
        await api.updateUser(editUser.id, data)
        toast.success('User berhasil diupdate')
      } else {
        await api.createUser(data)
        toast.success('User berhasil ditambahkan')
      }
      setDialogOpen(false)
      setEditUser(null)
      resetForm()
      fetchUsers()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditUser(user)
    setForm({ username: user.username, nama: user.nama, kataSandi: '', role: user.role })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.deleteUser(deleteId)
      toast.success('User berhasil dihapus')
      setDeleteId(null)
      fetchUsers()
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
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Kelola User</h1>
        </div>
        <Button onClick={() => { resetForm(); setEditUser(null); setDialogOpen(true) }} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
          <Plus className="mr-2 h-4 w-4" /> Tambah Kasir
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#465C88]">
            <TableHead>Username</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center w-28">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-[#465C88]">Belum ada data user</TableCell>
            </TableRow>
          ) : users.map((user, i) => (
            <TableRow key={user.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-mono text-sm text-[#465C88]">{user.username}</TableCell>
              <TableCell className="font-medium text-black">{user.nama}</TableCell>
              <TableCell>
                <Badge className={user.role === 'ADMIN' ? 'bg-[#FF7A30]' : 'bg-[#465C88]'}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={user.aktif ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                  {user.aktif ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 text-[#465C88] hover:text-[#FF7A30] hover:bg-[#FF7A30]/10">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {user.role !== 'ADMIN' && (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#E9E3DF]">
          <DialogHeader>
            <DialogTitle className="text-black">{editUser ? 'Edit User' : 'Tambah User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="border-[#E9E3DF]" disabled={!!editUser} />
            </div>
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>{editUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</Label>
              <Input type="password" value={form.kataSandi} onChange={(e) => setForm({ ...form, kataSandi: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="border-[#E9E3DF]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KASIR">Kasir</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogTitle className="text-black">Hapus User?</AlertDialogTitle>
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
