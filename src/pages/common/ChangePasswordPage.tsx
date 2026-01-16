import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { KeyRound, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const newPassRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  const handleSave = () => {
    if (!form.current || !form.newPass || !form.confirm) {
      toast.error('Semua field harus diisi')
      return
    }
    if (form.newPass !== form.confirm) {
      toast.error('Password baru tidak cocok')
      return
    }
    if (form.newPass.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    
    const result = changePassword(form.current, form.newPass)
    if (result.success) {
      toast.success(result.message)
      setForm({ current: '', newPass: '', confirm: '' })
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-[#E9E3DF]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-black">
            <div className="p-2 bg-[#FF7A30] rounded-lg">
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            Ganti Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password Saat Ini</Label>
            <div className="relative">
              <Input 
                tabIndex={1}
                autoFocus
                type={showCurrent ? 'text' : 'password'} 
                value={form.current} 
                onChange={(e) => setForm({ ...form, current: e.target.value })} 
                onKeyDown={(e) => e.key === 'Enter' && newPassRef.current?.focus()}
                className="border-[#E9E3DF] pr-10"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465C88] hover:text-[#FF7A30]">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <div className="relative">
              <Input 
                ref={newPassRef}
                tabIndex={2}
                type={showNew ? 'text' : 'password'} 
                value={form.newPass} 
                onChange={(e) => setForm({ ...form, newPass: e.target.value })} 
                onKeyDown={(e) => e.key === 'Enter' && confirmRef.current?.focus()}
                className="border-[#E9E3DF] pr-10"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465C88] hover:text-[#FF7A30]">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input 
                ref={confirmRef}
                tabIndex={3}
                type={showConfirm ? 'text' : 'password'} 
                value={form.confirm} 
                onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                onKeyDown={(e) => e.key === 'Enter' && submitRef.current?.click()}
                className="border-[#E9E3DF] pr-10"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465C88] hover:text-[#FF7A30]">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button ref={submitRef} tabIndex={4} onClick={handleSave} className="w-full bg-[#FF7A30] hover:bg-[#e86a20] text-white">Ubah Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}
