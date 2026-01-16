const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<ApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, kataSandi: password }),
    })
  }

  async logout() {
    return this.request<ApiResponse>('/auth/logout', { method: 'POST' })
  }

  async getProfile() {
    return this.request('/auth/profil')
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<ApiResponse>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ kataSandiSaatIni: currentPassword, kataSandiBaru: newPassword }),
    })
  }

  // Users
  async getUsers() {
    return this.request('/users')
  }

  async createUser(data: any) {
    return this.request<ApiResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: any) {
    return this.request<ApiResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request<ApiResponse>(`/users/${id}`, { method: 'DELETE' })
  }

  // Products
  async getProducts(params?: { search?: string; aktif?: boolean; halaman?: number; batas?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.aktif !== undefined) query.append('aktif', String(params.aktif))
    if (params?.halaman) query.append('halaman', String(params.halaman))
    if (params?.batas) query.append('batas', String(params.batas))
    return this.request(`/products?${query}`)
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  async createProduct(data: any) {
    return this.request<ApiResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request<ApiResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request<ApiResponse>(`/products/${id}`, { method: 'DELETE' })
  }

  // Transactions
  async getTransactions(params?: any) {
    const query = new URLSearchParams(params)
    return this.request(`/transactions?${query}`)
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`)
  }

  async createTransaction(data: any) {
    return this.request<ApiResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Stock
  async getStockAdjustments(params?: any) {
    const query = new URLSearchParams(params)
    return this.request(`/stok/penyesuaian?${query}`)
  }

  async createStockAdjustment(data: any) {
    return this.request<ApiResponse>('/stok/penyesuaian', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Reports
  async getSalesSummary(startDate: string, endDate: string) {
    return this.request(`/reports/sales-summary?startDate=${startDate}&endDate=${endDate}`)
  }

  async getTopProducts(params?: { startDate?: string; endDate?: string; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.limit) query.append('limit', String(params.limit))
    return this.request(`/reports/top-products?${query}`)
  }

  async getLowStock(threshold?: number) {
    return this.request(`/reports/low-stock?threshold=${threshold || 10}`)
  }

  // Categories
  async getCategories() {
    return this.request('/categories')
  }

  async createCategory(nama: string) {
    return this.request<ApiResponse>('/categories', {
      method: 'POST',
      body: JSON.stringify({ nama }),
    })
  }

  async updateCategory(id: string, nama: string) {
    return this.request<ApiResponse>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nama }),
    })
  }

  async deleteCategory(id: string) {
    return this.request<ApiResponse>(`/categories/${id}`, { method: 'DELETE' })
  }

  // Profile
  async getUserProfile() {
    return this.request('/profile')
  }

  async updateProfile(data: any) {
    return this.request<ApiResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
