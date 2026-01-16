import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { users as initialUsers } from '@/data'

interface AuthContextType {
  user: User | null
  users: User[]
  login: (username: string, password: string) => { success: boolean; message: string }
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string }
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users')
    return saved ? JSON.parse(saved) : initialUsers
  })

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = (username: string, password: string): { success: boolean; message: string } => {
    const found = users.find(u => u.username === username)
    if (!found) {
      return { success: false, message: 'Username tidak ditemukan' }
    }
    if (found.password !== password) {
      return { success: false, message: 'Password salah' }
    }
    setUser(found)
    return { success: true, message: 'Login berhasil' }
  }

  const logout = () => setUser(null)

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (!user) {
      return { success: false, message: 'User tidak ditemukan' }
    }
    if (user.password !== currentPassword) {
      return { success: false, message: 'Password saat ini salah' }
    }
    const updatedUser = { ...user, password: newPassword }
    setUsers(users.map(u => u.id === user.id ? updatedUser : u))
    setUser(updatedUser)
    return { success: true, message: 'Password berhasil diubah' }
  }

  return (
    <AuthContext.Provider value={{ user, users, login, logout, changePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
