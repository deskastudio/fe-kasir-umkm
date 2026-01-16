import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Semua field harus diisi')
      return
    }
    
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }
    
    if (form.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    
    setLoading(true)
    const result = await changePassword(form.currentPassword, form.newPassword)
    setLoading(false)
    
    if (result.success) {
      toast.success(result.message)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => navigate('/profile'), 1000)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#465C88] rounded-lg">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Ubah Password</h1>
      </div>

      <Card className="border-[#E9E3DF]">
        <CardHeader>
          <CardTitle className="text-black">Ganti Password Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Password Saat Ini</Label>
              <Input 
                type="password" 
                value={form.currentPassword} 
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} 
                className="border-[#E9E3DF]" 
              />
            </div>
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <Input 
                type="password" 
                value={form.newPassword} 
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
                className="border-[#E9E3DF]" 
              />
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password Baru</Label>
              <Input 
                type="password" 
                value={form.confirmPassword} 
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
                className="border-[#E9E3DF]" 
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/profile')} className="border-[#E9E3DF]">
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
