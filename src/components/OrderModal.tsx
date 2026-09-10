import { useState } from 'react'
import type { OrderItemInput } from '@/lib/orders'
import { insertOrder } from '@/lib/orders'
import { formatIdr } from '@/lib/format'

interface OrderModalProps {
  cart: Array<OrderItemInput>
  subtotalIdr: number
  totalIdr: number
  onClose: () => void
  onOrderPlaced: () => void
}

export default function OrderModal({
  cart,
  subtotalIdr,
  totalIdr,
  onClose,
  onOrderPlaced,
}: OrderModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !whatsappNumber.trim()) return

    setSubmitting(true)
    setError('')

    const { error } = await insertOrder({
      customerName: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      items: cart,
      subtotalIdr,
      totalIdr,
      notes: notes.trim() || undefined,
    })

    setSubmitting(false)

    if (error) {
      setError('Something went wrong. Please try again.')
      return
    }

    onOrderPlaced()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Complete Your Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name}</span>
              <span>₩{item.priceKRW.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-1 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatIdr(totalIdr)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Full Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full p-2 border rounded text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">WhatsApp Number</label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
              placeholder="08xx-xxxx-xxxx"
              className="w-full p-2 border rounded text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2 border rounded text-sm mt-1"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-rose-600 transition"
          >
            {submitting ? 'Submitting...' : 'Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  )
}