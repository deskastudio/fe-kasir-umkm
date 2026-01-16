import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading] = useState(false)

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#465C88] rounded-lg">
          <User className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black">Profil Saya</h1>
      </div>

      <Card className="border-[#E9E3DF]">
        <CardHeader>
          <CardTitle className="text-black">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user.username} disabled className="border-[#E9E3DF] bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={user.name} disabled className="border-[#E9E3DF] bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge className={user.role === 'admin' ? 'bg-[#FF7A30]' : 'bg-[#465C88]'}>
                {user.role.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bergabung Sejak</Label>
            <Input value={new Date(user.createdAt).toLocaleDateString('id-ID')} disabled className="border-[#E9E3DF] bg-gray-50" />
          </div>
          <div className="pt-4">
            <Button asChild className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
              <a href="/change-password">Ubah Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
