import { useState } from 'react'
import { users as initialUsers } from '@/data'
import type { User, Role } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers.filter(u => u.role === 'kasir'))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', role: 'kasir' as Role })

  const resetForm = () => setForm({ username: '', name: '', email: '', password: '', role: 'kasir' as Role })

  const handleSave = () => {
    if (!form.username || !form.name || !form.email) {
      toast.error('Semua field harus diisi')
      return
    }
    if (!editUser && !form.password) {
      toast.error('Password harus diisi')
      return
    }
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, username: form.username, name: form.name, email: form.email, role: form.role, ...(form.password && { password: form.password }) } : u))
      toast.success('User berhasil diupdate')
    } else {
      const newUser: User = { id: `usr-${Date.now()}`, ...form, createdAt: new Date().toISOString() }
      setUsers([...users, newUser])
      toast.success('User berhasil ditambahkan')
    }
    setDialogOpen(false)
    setEditUser(null)
    resetForm()
  }

  const handleEdit = (user: User) => {
    setEditUser(user)
    setForm({ username: user.username, name: user.name, email: user.email, password: '', role: user.role })
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (deleteId) {
      setUsers(users.filter(u => u.id !== deleteId))
      toast.success('User berhasil dihapus')
      setDeleteId(null)
    }
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
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
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
              <TableCell className="font-medium text-black">{user.username}</TableCell>
              <TableCell className="text-black">{user.name}</TableCell>
              <TableCell className="text-[#465C88]">{user.email}</TableCell>
              <TableCell><Badge className="bg-[#465C88] text-white">{user.role}</Badge></TableCell>
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 text-[#465C88] hover:text-[#FF7A30] hover:bg-[#FF7A30]/10">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
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
            <DialogTitle className="text-black">{editUser ? 'Edit User' : 'Tambah Kasir'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-[#E9E3DF]" />
            </div>
            <div className="space-y-2">
              <Label>{editUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border-[#E9E3DF]" placeholder={editUser ? 'Kosongkan jika tidak diubah' : ''} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger className="border-[#E9E3DF]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
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
