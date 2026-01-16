import usersData from './users.json'
import productsData from './products.json'
import categoriesData from './categories.json'
import transactionsData from './transactions.json'
import type { User, Product, Category, Transaction } from '@/types'

export const users: User[] = usersData as User[]
export const products: Product[] = productsData as Product[]
export const categories: Category[] = categoriesData as Category[]
export const transactions: Transaction[] = transactionsData as Transaction[]

export const getCategoryName = (categoryId: string): string => {
  return categories.find(c => c.id === categoryId)?.name ?? 'Unknown'
}
