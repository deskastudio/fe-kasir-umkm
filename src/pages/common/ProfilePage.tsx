import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })

  const handleSave = () => {
    if (!form.name || !form.email) {
      toast.error('Semua field harus diisi')
      return
    }
    toast.success('Profil berhasil diupdate')
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profil Saya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div><Badge variant="secondary" className="capitalize">{user?.role}</Badge></div>
          </div>
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button onClick={handleSave} className="w-full">Simpan</Button>
        </CardContent>
      </Card>
    </div>
  )
}
