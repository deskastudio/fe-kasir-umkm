import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { api } from '@/lib/api'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.login(username, password)
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data
        
        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          name: userData.nama || userData.name,
          email: userData.email || '',
          role: userData.role.toLowerCase() as 'admin' | 'kasir',
          password: '',
          createdAt: userData.dibuatPada || userData.createdAt,
        }
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(mappedUser))
        setUser(mappedUser)
        
        return { success: true, message: response.message }
      }
      
      return { success: false, message: response.message || 'Login gagal' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Terjadi kesalahan' }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.changePassword(currentPassword, newPassword)
      return { success: response.success, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || 'Gagal mengubah password' }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
