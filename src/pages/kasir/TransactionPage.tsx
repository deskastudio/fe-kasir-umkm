import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { extractData } from '@/lib/utils-api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Minus, Trash2, ShoppingCart, Search, Percent, Loader2, Filter } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { ReceiptDialog } from '@/components/ReceiptDialog'

interface Product {
  id: string
  kode: string
  nama: string
  kategori: string | null
  harga: number
  stok: number
}

interface CartItem {
  product: Product
  quantity: number
}

export default function TransactionPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [payment, setPayment] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [receiptData, setReceiptData] = useState<any>(null)

  const paymentRef = useRef<HTMLInputElement>(null)
  const submitPaymentRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    Promise.all([
      api.getProducts({ batas: 100, aktif: true }),
      api.getCategories()
    ]).then(([prodRes, catRes]) => {
      setProducts(extractData(prodRes))
      const cats = extractData(catRes)
      setCategories(Array.isArray(cats) ? cats.map((c: any) => c.nama) : [])
    }).finally(() => setLoading(false))
  }, [])

  const filteredProducts = products.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.kode.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'all' || p.kategori === selectedCategory
    return matchSearch && matchCategory && p.stok > 0
  })

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const existing = cart.find(c => c.product.id === productId)
    if (existing) {
      if (existing.quantity >= product.stok) {
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
      if (newQty > c.product.stok) {
        toast.error('Stok tidak mencukupi')
        return c
      }
      return { ...c, quantity: newQty }
    }))
  }

  const removeFromCart = (productId: string) => setCart(cart.filter(c => c.product.id !== productId))

  const subtotal = cart.reduce((sum, c) => sum + c.product.harga * c.quantity, 0)
  const discountNum = Number(discountValue) || 0
  const discountAmount = discountType === 'percent' ? Math.min(subtotal * (discountNum / 100), subtotal) : Math.min(discountNum, subtotal)
  const total = subtotal - discountAmount
  const paymentNum = Number(payment) || 0
  const change = paymentNum - total

  const handleCheckout = async () => {
    if (paymentNum < total) {
      toast.error('Pembayaran kurang')
      return
    }

    setProcessing(true)
    try {
      const res = await api.createTransaction({
        item: cart.map(c => ({
          idProduk: c.product.id,
          jumlah: c.quantity,
        })),
        jumlahBayar: paymentNum,
      })

      if (res.success) {
        setReceiptData({
          id: res.data.noFaktur,
          items: cart.map(c => ({ name: c.product.nama, price: c.product.harga, quantity: c.quantity })),
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
        
        // Refresh products untuk update stok
        const prodRes = await api.getProducts({ batas: 100, aktif: true })
        setProducts(extractData(prodRes))
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenCheckout = () => {
    setCheckoutOpen(true)
    setTimeout(() => paymentRef.current?.focus(), 100)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#465C88]" /></div>
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="space-y-3 mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#465C88]" />
            <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-[#E9E3DF]" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] border-[#E9E3DF] bg-white">
              <Filter className="h-4 w-4 mr-2 text-[#465C88]" />
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1 min-h-[300px] lg:min-h-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {filteredProducts.map(product => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow border-[#E9E3DF] hover:border-[#FF7A30]" onClick={() => addToCart(product.id)}>
                <CardContent className="p-3 sm:p-4">
                  <p className="font-medium truncate text-black text-sm sm:text-base">{product.nama}</p>
                  <p className="text-xs text-[#465C88]">{product.kode}</p>
                  <p className="text-base sm:text-lg font-bold mt-1 text-[#FF7A30]">{formatRupiah(product.harga)}</p>
                  <Badge variant="secondary" className="mt-2 bg-[#E9E3DF] text-[#465C88] text-xs">Stok: {product.stok}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="w-full lg:w-80 flex flex-col border-[#E9E3DF]">
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
                  <p className="font-medium truncate text-sm text-black">{item.product.nama}</p>
                  <p className="text-sm text-[#FF7A30]">{formatRupiah(item.product.harga)}</p>
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
                  <SelectTrigger className="w-24 h-8 border-[#465C88]/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="nominal">Rp</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="h-8 flex-1 border-[#465C88]/30" />
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
                <span className="text-[#465C88]">Diskon</span>
                <span className="text-red-500">-{formatRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E9E3DF]">
              <span className="text-black">Total</span>
              <span className="text-[#FF7A30]">{formatRupiah(total)}</span>
            </div>
            <Button className="w-full bg-[#FF7A30] hover:bg-[#e86a20] text-white" disabled={cart.length === 0} onClick={handleOpenCheckout}>
              Bayar
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
                  <span>Diskon</span>
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
              <Input ref={paymentRef} type="number" placeholder="Masukkan jumlah uang" value={payment} onChange={(e) => setPayment(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && paymentNum >= total && submitPaymentRef.current?.click()}
                className="border-[#E9E3DF] text-lg h-12" />
            </div>
            {paymentNum >= total && paymentNum > 0 && (
              <div className="flex justify-between text-lg p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Kembalian</span>
                <span className="font-bold text-green-700">{formatRupiah(change)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} className="border-[#E9E3DF]">Batal</Button>
            <Button ref={submitPaymentRef} onClick={handleCheckout} disabled={paymentNum < total || processing} className="bg-[#FF7A30] hover:bg-[#e86a20] text-white">
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptDialog open={receiptOpen} onClose={() => setReceiptOpen(false)} data={receiptData} />
    </div>
  )
}
