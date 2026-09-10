import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import products from '@/data/products'
import type { OrderItemInput } from '@/lib/orders'
import { KRW_TO_IDR, formatIdr, getJastipFeePercent } from '@/lib/format'
import OrderModal from '@/components/OrderModal'

export const Route = createFileRoute('/')({
  component: Home,
})

const onlineMalls = [
  {
    name: 'Olive Young',
    url: 'https://www.oliveyoung.co.kr/store/main/main.do?oy=0',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  {
    name: 'Daiso Mall',
    url: 'https://www.daisomall.co.kr/ds',
    className: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
  },
  {
    name: 'ZigZag',
    url: 'https://zigzag.kr/',
    className: 'bg-purple-900 text-white border-gray-900 hover:bg-gray-700',
  },
]

function Home() {
  const [cart, setCart] = useState<Array<OrderItemInput>>([])
  const [customUrl, setCustomUrl] = useState('')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const addToCart = (item: OrderItemInput) => setCart((prev) => [...prev, item])
  const removeFromCart = (index: number) =>
    setCart((prev) => prev.filter((_, i) => i !== index))

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(customPrice)
    if (!customName.trim() || !price) return
    addToCart({ name: customName.trim(), priceKRW: price, url: customUrl.trim() || undefined })
    setCustomName('')
    setCustomPrice('')
    setCustomUrl('')
  }

  const totalKRW = cart.reduce((sum, item) => sum + item.priceKRW, 0)
  const subtotalIdr = totalKRW * KRW_TO_IDR
  const totalFees = cart.reduce(
  (sum, item) => sum + item.priceKRW * KRW_TO_IDR * getJastipFeePercent(item.priceKRW),
  0
)
  const grandTotal = subtotalIdr + totalFees

  const handleProceedToOrder = () => {
    setShowOrderModal(true)
  }

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-rose-500">PilihanChingu.id</h1>
          <div className="relative bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            🛒 Cart ({cart.length})
          </div>
        </div>
      </nav>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-black-400 uppercase tracking-wide">
            Supporting Online Malls
          </span>
          {onlineMalls.map((mall) => (
            
              <a key={mall.name}
              href={mall.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-1.5 rounded-lg border text-sm font-bold transition ${mall.className}`}
            >
              {mall.name}
            </a>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Curated Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((item) => {
                const estIDR = item.priceKRW * KRW_TO_IDR * (1 + getJastipFeePercent(item.priceKRW))
                return (
                  <div key={item.id} className="bg-white rounded-xl border p-4 space-y-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg" />
                      ₩{item.priceKRW.toLocaleString()} · est. {formatIdr(estIDR)}
                    </p>
                    <button
                      onClick={() =>
                        addToCart({ name: item.name, priceKRW: item.priceKRW, url: item.url })
                      }
                      className="w-full bg-rose-50 text-rose-600 border border-rose-200 rounded-lg py-1.5 text-sm font-semibold hover:bg-rose-100 transition"
                    >
                      Add to cart
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="font-bold">Custom Request (Olive Young, ZigZag, Daiso)</h3>
            <p className="text-xs text-gray-500">
              Paste an item link and price from any Korean store to add it to your order.
            </p>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Item name"
                required
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Item URL (optional)"
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Price (KRW)"
                required
                className="w-full p-2 border rounded text-sm"
              />
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
              >
                Add custom item
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="font-bold">Your Cart</h3>
            {cart.length === 0 && (
              <p className="text-sm text-gray-500">No items yet.</p>
            )}
            <ul className="space-y-2">
              {cart.map((item, i) => (
                <li key={i} className="flex justify-between items-start text-sm gap-2">
                  <span>
                    {item.name}
                    <span className="block text-xs text-gray-400">
                      ₩{item.priceKRW.toLocaleString()}
                    </span>
                  </span>
                  <button
                    onClick={() => removeFromCart(i)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

              {cart.length > 0 && (
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatIdr(subtotalIdr)}</span>
                  </div>
                  <p className="text-xs text-gray-400">Includes jastip fee, excludes shipping fee</p>
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>Total</span>
                    <span>{formatIdr(grandTotal)}</span>
                  </div>
                </div>
               )}

            <button
              onClick={handleProceedToOrder}
              disabled={cart.length === 0}
              className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-rose-600 transition"
            >
              Proceed to Order
            </button>
          </div>
        </aside>
            </main>

      {showOrderModal && (
        <OrderModal
          cart={cart}
          subtotalIdr={subtotalIdr}
          totalIdr={grandTotal}
          onClose={() => setShowOrderModal(false)}
          onOrderPlaced={() => {
            setShowOrderModal(false)
            setCart([])
            setOrderPlaced(true)
          }}
        />
      )}

      {orderPlaced && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
          Order placed! We'll contact you on WhatsApp soon.
          <button onClick={() => setOrderPlaced(false)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}