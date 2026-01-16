import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Suspense, lazy } from 'react'
import { DashboardSkeleton, TableSkeleton, TransactionSkeleton, ProfileSkeleton, ReportSkeleton } from '@/components/Skeletons'
import type { ReactNode } from 'react'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'))
const ProductManagement = lazy(() => import('@/pages/admin/ProductManagement'))
const StockManagement = lazy(() => import('@/pages/admin/StockManagement'))
const TransactionList = lazy(() => import('@/pages/admin/TransactionList'))
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'))
const KasirDashboard = lazy(() => import('@/pages/kasir/Dashboard'))
const TransactionPage = lazy(() => import('@/pages/kasir/TransactionPage'))
const ProductList = lazy(() => import('@/pages/kasir/ProductList'))
const TransactionHistory = lazy(() => import('@/pages/kasir/TransactionHistory'))
const ProfilePage = lazy(() => import('@/pages/common/ProfilePage'))
const ChangePasswordPage = lazy(() => import('@/pages/common/ChangePasswordPage'))

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/kasir'} replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/kasir'} replace /> : 
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><DashboardSkeleton /></div>}>
          <LoginPage />
        </Suspense>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<DashboardSkeleton />}><AdminDashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<TableSkeleton />}><UserManagement /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<TableSkeleton cols={6} />}><ProductManagement /></Suspense>} />
        <Route path="stock" element={<Suspense fallback={<TableSkeleton />}><StockManagement /></Suspense>} />
        <Route path="transactions" element={<Suspense fallback={<TableSkeleton cols={7} />}><TransactionList /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<ReportSkeleton />}><ReportsPage /></Suspense>} />
      </Route>

      {/* Kasir Routes */}
      <Route path="/kasir" element={<ProtectedRoute allowedRoles={['kasir']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<DashboardSkeleton />}><KasirDashboard /></Suspense>} />
        <Route path="transaction" element={<Suspense fallback={<TransactionSkeleton />}><TransactionPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<TableSkeleton />}><ProductList /></Suspense>} />
        <Route path="history" element={<Suspense fallback={<TableSkeleton cols={6} />}><TransactionHistory /></Suspense>} />
      </Route>

      {/* Common Routes */}
      <Route path="/profile" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<ProfileSkeleton />}><ProfilePage /></Suspense>} />
      </Route>
      <Route path="/change-password" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<ProfileSkeleton />}><ChangePasswordPage /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}
