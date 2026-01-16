export type Role = 'admin' | 'kasir'

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: Role
  email: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string
  sku: string
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Transaction {
  id: string
  items: { productId: string; productName: string; price: number; quantity: number }[]
  total: number
  payment: number
  change: number
  cashierId: string
  cashierName: string
  createdAt: string
}
