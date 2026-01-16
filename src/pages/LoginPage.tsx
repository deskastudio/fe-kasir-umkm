import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Store, ShoppingBag, BarChart3, Package, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const passwordRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error('Username harus diisi')
      return
    }
    if (!password.trim()) {
      toast.error('Password harus diisi')
      return
    }
    const result = login(username, password)
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      toast.success(`Selamat datang, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/kasir')
    } else {
      toast.error(result.message)
    }
  }

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      passwordRef.current?.focus()
    }
  }

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitRef.current?.click()
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#465C88] rounded-xl">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">POS UMKM</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Selamat Datang!</h1>
            <p className="text-[#465C88]">Masuk untuk mengelola bisnis Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black font-medium">Username</Label>
              <Input
                id="username"
                tabIndex={1}
                autoFocus
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleUsernameKeyDown}
                className="h-12 border-[#E9E3DF] focus:border-[#FF7A30] focus:ring-[#FF7A30]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  ref={passwordRef}
                  tabIndex={2}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handlePasswordKeyDown}
                  className="h-12 border-[#E9E3DF] focus:border-[#FF7A30] focus:ring-[#FF7A30] pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465C88] hover:text-[#FF7A30]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button ref={submitRef} type="submit" tabIndex={3} className="w-full h-12 bg-[#FF7A30] hover:bg-[#e86a20] text-white text-base font-medium">
              Masuk <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#465C88] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}} />
        </div>
        
        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="bg-white rounded-2xl p-5 shadow-2xl transform -rotate-3 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FF7A30] rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-black">Transaksi Cepat</span>
              </div>
              <p className="text-sm text-[#465C88]">Proses penjualan dalam hitungan detik</p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-2xl transform rotate-2 mb-6 ml-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#465C88] rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-black">Laporan Lengkap</span>
              </div>
              <p className="text-sm text-[#465C88]">Analisis penjualan real-time</p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-2xl transform -rotate-2 ml-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FF7A30] rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-black">Kelola Stok</span>
              </div>
              <p className="text-sm text-[#465C88]">Pantau inventaris dengan mudah</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-3">Sistem Kasir Modern untuk UMKM</h2>
          <p className="text-[#E9E3DF] max-w-md">Kelola transaksi, stok, dan laporan bisnis Anda dalam satu platform yang mudah digunakan.</p>
        </div>
      </div>
    </div>
  )
}
