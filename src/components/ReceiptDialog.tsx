import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatRupiah } from '@/lib/utils'
import { Printer, Check, Download } from 'lucide-react'
import jsPDF from 'jspdf'

interface ReceiptItem {
  name: string
  price: number
  quantity: number
}

interface ReceiptData {
  id: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  total: number
  payment: number
  change: number
  cashierName: string
  date: Date
}

interface ReceiptDialogProps {
  open: boolean
  onClose: () => void
  data: ReceiptData | null
}

export function ReceiptDialog({ open, onClose, data }: ReceiptDialogProps) {
  if (!data) return null

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 160 + data.items.length * 10] })
    const w = 80
    let y = 10

    doc.setFillColor(70, 92, 136)
    doc.rect(0, 0, w, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Toko H.Ilyas', w / 2, 10, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Kp. Cirewed RT01/04, Ds. Sukadamai', w / 2, 16, { align: 'center' })
    doc.text('Telp: 081398243122', w / 2, 21, { align: 'center' })

    y = 32
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.text(`No: ${data.id}`, 5, y)
    doc.text(data.date.toLocaleDateString('id-ID'), w - 5, y, { align: 'right' })
    y += 5
    doc.text(`Kasir: ${data.cashierName}`, 5, y)
    doc.text(data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), w - 5, y, { align: 'right' })

    y += 5
    doc.setDrawColor(200, 200, 200)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(5, y, w - 5, y)
    y += 5

    doc.setFontSize(8)
    data.items.forEach(item => {
      doc.setFont('helvetica', 'bold')
      doc.text(item.name, 5, y)
      y += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(`${item.quantity} x ${formatRupiah(item.price)}`, 8, y)
      doc.text(formatRupiah(item.price * item.quantity), w - 5, y, { align: 'right' })
      y += 5
      doc.setFontSize(8)
    })

    doc.line(5, y, w - 5, y)
    y += 5
    doc.text('Subtotal', 5, y)
    doc.text(formatRupiah(data.subtotal), w - 5, y, { align: 'right' })
    y += 5

    if (data.discount > 0) {
      doc.setTextColor(220, 38, 38)
      doc.text('Diskon', 5, y)
      doc.text(`-${formatRupiah(data.discount)}`, w - 5, y, { align: 'right' })
      y += 5
      doc.setTextColor(0, 0, 0)
    }

    y += 2
    doc.setFillColor(255, 122, 48)
    doc.rect(5, y - 2, w - 10, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL', 8, y + 4)
    doc.text(formatRupiah(data.total), w - 8, y + 4, { align: 'right' })

    y += 14
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Tunai', 5, y)
    doc.text(formatRupiah(data.payment), w - 5, y, { align: 'right' })
    y += 5
    doc.text('Kembali', 5, y)
    doc.setFont('helvetica', 'bold')
    doc.text(formatRupiah(data.change), w - 5, y, { align: 'right' })

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.line(5, y, w - 5, y)
    y += 6
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text('Terima kasih atas kunjungan Anda!', w / 2, y, { align: 'center' })
    y += 4
    doc.text('Barang yang sudah dibeli tidak dapat dikembalikan', w / 2, y, { align: 'center' })

    return doc
  }

  const printReceipt = () => {
    const doc = generatePDF()
    doc.autoPrint()
    window.open(doc.output('bloburl'), '_blank')
  }

  const savePDF = () => {
    const doc = generatePDF()
    doc.save(`struk-${data.id}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-[#E9E3DF]">
        <DialogHeader>
          <DialogTitle className="text-black">Struk Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 border border-dashed border-[#E9E3DF] rounded-lg font-mono text-sm max-h-[50vh] overflow-y-auto">
          <div className="text-center mb-3 pb-3 border-b-2 border-[#465C88]">
            <h3 className="font-bold text-lg text-[#465C88]">POS UMKM</h3>
            <p className="text-xs text-[#465C88]">Jl. Contoh Alamat No. 123</p>
            <p className="text-xs text-[#465C88]">Telp: 0812-3456-7890</p>
          </div>

          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#465C88]">No: {data.id}</span>
            <span>{data.date.toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#465C88]">Kasir: {data.cashierName}</span>
            <span>{data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <Separator className="my-3" />

          <div className="space-y-2">
            {data.items.map((item, i) => (
              <div key={i}>
                <p className="font-medium text-black">{item.name}</p>
                <div className="flex justify-between text-xs text-[#465C88] pl-2">
                  <span>{item.quantity} x {formatRupiah(item.price)}</span>
                  <span>{formatRupiah(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Diskon</span>
                <span>-{formatRupiah(data.discount)}</span>
              </div>
            )}
          </div>

          <div className="mt-2 p-2 bg-[#FF7A30] rounded text-white">
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatRupiah(data.total)}</span>
            </div>
          </div>

          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Tunai</span>
              <span>{formatRupiah(data.payment)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembali</span>
              <span className="text-[#FF7A30]">{formatRupiah(data.change)}</span>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="text-center text-xs text-[#465C88]">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={savePDF} className="flex-1 border-[#E9E3DF]">
            <Download className="mr-2 h-4 w-4" /> Simpan PDF
          </Button>
          <Button variant="outline" onClick={printReceipt} className="flex-1 border-[#465C88] text-[#465C88]">
            <Printer className="mr-2 h-4 w-4" /> Cetak
          </Button>
        </div>
        <Button autoFocus onClick={onClose} className="w-full bg-[#FF7A30] hover:bg-[#e86a20] text-white">
          <Check className="mr-2 h-4 w-4" /> Selesai (Enter)
        </Button>
      </DialogContent>
    </Dialog>
  )
}
