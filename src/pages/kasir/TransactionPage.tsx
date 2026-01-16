import { useState, useRef } from 'react'
import { products, categories } from '@/data'
import { useAuth } from '@/contexts/AuthContext'
import type { CartItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Minus, Trash2, ShoppingCart, Search, Percent } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { ReceiptDialog } from '@/components/ReceiptDialog'

export default function TransactionPage() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [payment, setPayment] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [receiptData, setReceiptData] = useState<{
    id: string
    items: { name: string; price: number; quantity: number }[]
    subtotal: number
    discount: number
    total: number
    payment: number
    change: number
    cashierName: string
    date: Date
  } | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const paymentRef = useRef<HTMLInputElement>(null)
  const submitPaymentRef = useRef<HTMLButtonElement>(null)

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !selectedCategory || p.categoryId === selectedCategory
    return matchSearch && matchCategory && p.stock > 0
  })

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const existing = cart.find(c => c.product.id === productId)
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Stok tidak mencukupi')
        return
      }
      setCart(cart.map(c => c.product.id === productId ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.product.id !== productId) return c
      const newQty = c.quantity + delta
      if (newQty <= 0) return c
      if (newQty > c.product.stock) {
        toast.error('Stok tidak mencukupi')
        return c
      }
      return { ...c, quantity: newQty }
    }))
  }

  const removeFromCart = (productId: string) => setCart(cart.filter(c => c.product.id !== productId))

  const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0)
  
  const discountNum = Number(discountValue) || 0
  const discountAmount = discountType === 'percent' 
    ? Math.min(subtotal * (discountNum / 100), subtotal)
    : Math.min(discountNum, subtotal)
  
  const total = subtotal - discountAmount
  const paymentNum = Number(payment) || 0
  const change = paymentNum - total

  const clearDiscount = () => setDiscountValue('')

  const handleCheckout = () => {
    if (paymentNum < total) {
      toast.error('Pembayaran kurang')
      return
    }

    const trxId = `TRX-${Date.now()}`
    setReceiptData({
      id: trxId,
      items: cart.map(c => ({ name: c.product.name, price: c.product.price, quantity: c.quantity })),
      subtotal,
      discount: discountAmount,
      total,
      payment: paymentNum,
      change,
      cashierName: user?.name || 'Kasir',
      date: new Date()
    })

    toast.success('Transaksi berhasil!')
    setCart([])
    setPayment('')
    setDiscountValue('')
    setCheckoutOpen(false)
    setReceiptOpen(true)
  }

  // Focus payment input when checkout dialog opens
  const handleOpenCheckout = () => {
    setCheckoutOpen(true)
    setTimeout(() => paymentRef.current?.focus(), 100)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#465C88]" />
            <Input 
              ref={searchRef}
              tabIndex={1}
              placeholder="Cari produk... (tekan Enter)" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-10 bg-white border-[#E9E3DF]" 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              tabIndex={2}
              variant={!selectedCategory ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? 'bg-[#FF7A30] hover:bg-[#e86a20] text-white' : 'bg-white border-[#E9E3DF] text-black hover:bg-gray-50'}
            >
              Semua
            </Button>
            {categories.map((c, i) => (
              <Button 
                key={c.id}
                tabIndex={3 + i}
                variant={selectedCategory === c.id ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedCategory(c.id)}
                className={selectedCategory === c.id ? 'bg-[#FF7A30] hover:bg-[#e86a20] text-white' : 'bg-white border-[#E9E3DF] text-black hover:bg-gray-50'}
              >
                {c.name}
              </Button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product, i) => (
              <Card 
                key={product.id} 
                tabIndex={10 + i}
                className="cursor-pointer hover:shadow-md transition-shadow border-[#E9E3DF] hover:border-[#FF7A30] focus:border-[#FF7A30] focus:ring-2 focus:ring-[#FF7A30] outline-none" 
                onClick={() => addToCart(product.id)}
                onKeyDown={(e) => e.key === 'Enter' && addToCart(product.id)}
              >
                <CardContent className="p-4">
                  <p className="font-medium truncate text-black">{product.name}</p>
                  <p className="text-lg font-bold mt-1 text-[#FF7A30]">{formatRupiah(product.price)}</p>
                  <Badge variant="secondary" className="mt-2 bg-[#E9E3DF] text-[#465C88]">Stok: {product.stock}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="w-80 flex flex-col border-[#E9E3DF]">
        <CardHeader className="pb-2 bg-[#465C88] text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang
            {cart.length > 0 && <Badge className="bg-[#FF7A30]">{cart.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <ScrollArea className="flex-1 -mx-4 px-4">
            {cart.length === 0 ? (
              <p className="text-center text-[#465C88] py-8">Keranjang kosong</p>
            ) : cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-2 py-3 border-b border-[#E9E3DF] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm text-black">{item.product.name}</p>
                  <p className="text-sm text-[#FF7A30]">{formatRupiah(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7 border-[#E9E3DF]" onClick={() => updateQty(item.product.id, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm text-black">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 border-[#E9E3DF]" onClick={() => updateQty(item.product.id, 1)}><Plus className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </ScrollArea>
          
          <Separator className="my-3 bg-[#E9E3DF]" />
          
          {cart.length > 0 && (
            <div className="mb-3 p-3 bg-[#E9E3DF] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-[#465C88]" />
                <span className="text-sm font-medium text-[#465C88]">Diskon</span>
              </div>
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percent' | 'nominal')}>
                  <SelectTrigger className="w-24 h-8 border-[#465C88]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="nominal">Rp</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="h-8 flex-1 border-[#465C88]/30"
                />
                {discountValue && (
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={clearDiscount}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#465C88]">Subtotal</span>
              <span className="text-black">{formatRupiah(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#465C88]">Diskon {discountType === 'percent' ? `(${discountNum}%)` : ''}</span>
                <span className="text-red-500">-{formatRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E9E3DF]">
              <span className="text-black">Total</span>
              <span className="text-[#FF7A30]">{formatRupiah(total)}</span>
            </div>
            <Button className="w-full bg-[#FF7A30] hover:bg-[#e86a20] text-white" disabled={cart.length === 0} onClick={handleOpenCheckout}>
              Bayar (F2)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="border-[#E9E3DF]">
          <DialogHeader>
            <DialogTitle className="text-black">Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-[#E9E3DF] rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>Diskon {discountType === 'percent' ? `(${discountNum}%)` : ''}</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#465C88]/20">
                <span className="text-black">Total</span>
                <span className="text-[#FF7A30]">{formatRupiah(total)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Jumlah Bayar</Label>
              <Input 
                ref={paymentRef}
                tabIndex={1}
                type="number" 
                placeholder="Masukkan jumlah uang" 
                value={payment} 
                onChange={(e) => setPayment(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && paymentNum >= total && submitPaymentRef.current?.click()}
                className="border-[#E9E3DF] text-lg h-12" 
              />
            </div>
            {paymentNum >= total && paymentNum > 0 && (
              <div className="flex justify-between text-lg p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Kembalian</span>
                <span className="font-bold text-green-700">{formatRupiah(change)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button tabIndex={3} variant="outline" onClick={() => setCheckoutOpen(false)} className="border-[#E9E3DF]">Batal</Button>
            <Button ref={submitPaymentRef} tabIndex={2} onClick={handleCheckout} disabled={paymentNum < total} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
              Selesai (Enter)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptDialog open={receiptOpen} onClose={() => setReceiptOpen(false)} data={receiptData} />
    </div>
  )
}
