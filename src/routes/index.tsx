import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import products from '@/data/products'
import type { OrderItemInput, ShippingOption } from '@/lib/orders'
import { fetchShippingOptions } from '@/lib/orders'
import { formatIdr } from '@/lib/format'
import { getKrwToIdrRate } from '@/lib/fx'
import { calculateItemTotalIDRSync, calculateFeeDiscount } from '@/lib/pricing'
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

const DISCOUNT_SUBTOTAL_THRESHOLD_IDR = 1_000_000
const DISCOUNT_ITEM_COUNT_THRESHOLD = 10

function Home() {
  const [cart, setCart] = useState<Array<OrderItemInput>>([])
  const [customUrl, setCustomUrl] = useState('')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customImage, setCustomImage] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [rate, setRate] = useState<number | null>(null)
  const [shippingOptions, setShippingOptions] = useState<Array<ShippingOption>>([])
  const [selectedShippingId, setSelectedShippingId] = useState<string>('')

  useEffect(() => {
    getKrwToIdrRate().then(setRate)
  }, [])

  useEffect(() => {
    fetchShippingOptions().then(({ data }) => {
      setShippingOptions(data)
      if (data.length > 0) setSelectedShippingId(data[0].id)
    })
  }, [])

  const addToCart = (item: OrderItemInput) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.name === item.name && i.url === item.url)
      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        }
        return updated
      }
      return [...prev, item]
    })
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)))
  }

  const removeFromCart = (index: number) =>
    setCart((prev) => prev.filter((_, i) => i !== index))

  const fetchLinkPreview = async (url: string) => {
    if (!url.trim()) return
    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (data.title) setCustomName(data.title)
      if (data.price) setCustomPrice(String(data.price))
      if (data.image) setCustomImage(data.image)
    } catch {
      // if it fails, the customer just fills the form manually — no error shown
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(customPrice)
    if (!customName.trim() || !price) return
    addToCart({
      name: customName.trim(),
      priceKRW: price,
      url: customUrl.trim() || undefined,
      image: customImage || undefined,
      quantity: 1,
    })
    setCustomName('')
    setCustomPrice('')
    setCustomUrl('')
    setCustomImage('')
  }

  const effectiveRate = rate ?? 12

  let subtotalIdr = 0
  let totalFeeIdr = 0
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  for (const item of cart) {
    const { itemCostIDR, feeIDR } = calculateItemTotalIDRSync(item.priceKRW, item.quantity, effectiveRate)
    subtotalIdr += itemCostIDR
    totalFeeIdr += feeIDR
  }

  const { discountPercent, discountAmountIDR } = calculateFeeDiscount(totalItemCount, subtotalIdr, totalFeeIdr)
  const totalFees = totalFeeIdr - discountAmountIDR
  const originalTotal = subtotalIdr + totalFeeIdr
  const grandTotal = subtotalIdr + totalFees

  const amountNeededForDiscount = DISCOUNT_SUBTOTAL_THRESHOLD_IDR - subtotalIdr
  const itemsNeededForDiscount = DISCOUNT_ITEM_COUNT_THRESHOLD - totalItemCount

  const selectedShippingOption = shippingOptions.find((o) => o.id === selectedShippingId)
  const selectedShippingLabel = selectedShippingOption?.label ?? ''

  const handleProceedToOrder = () => {
    setShowOrderModal(true)
  }

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-rose-500">PilihanChingu.id</h1>
          <button
            onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="relative bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 transition"
          >
            🛒 Cart ({cart.length})
          </button>
        </div>
      </nav>

      <div className="bg-rose-50 border-b border-rose-100 text-center py-2 px-4">
        <p className="text-xs sm:text-sm text-rose-700 font-medium">
          🎉 Diskon 7% untuk belanja produk di atas Rp1.000.000 (di luar shipping fee), atau{' '}
          <span className="font-bold">5% off</span> untuk 10+ item!
        </p>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-black-400 uppercase tracking-wide">
            Supporting Online Malls
          </span>
          {onlineMalls.map((mall) => {
            return (
              <a
                key={mall.name}
                href={mall.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-1.5 rounded-lg border text-sm font-bold transition ${mall.className}`}
              >
                {mall.name}
              </a>
            )
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Curated Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((item) => {
                const estIDR = calculateItemTotalIDRSync(item.priceKRW, 1, effectiveRate).totalIDR
                return (
                  <div
                    key={item.id}
                    className="flex flex-col bg-white rounded-xl border p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                    <p className="font-semibold text-sm leading-snug h-10 overflow-hidden">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      ₩{item.priceKRW.toLocaleString()}
                      <br />
                      <span className="text-gray-400">est. {formatIdr(estIDR)}</span>
                    </p>
                    <button
                      onClick={() =>
                        addToCart({ name: item.name, priceKRW: item.priceKRW, url: item.url, image: item.image, quantity: 1 })
                      }
                      className="w-full mt-auto bg-rose-50 text-rose-600 border border-rose-200 rounded-lg py-1.5 text-sm font-semibold hover:bg-rose-100 transition"
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
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text')
                  setCustomUrl(pasted)
                  fetchLinkPreview(pasted)
                }}
                placeholder="Item URL (optional) — paste a link to auto-fill"
                className="w-full p-2 border rounded text-sm"
              />
              {previewLoading && <p className="text-xs text-gray-400">Fetching product info…</p>}
              {customImage && (
                <img src={customImage} alt="Preview" className="h-20 w-20 object-cover rounded border" />
              )}
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

        <aside className="space-y-4" id="cart-section">
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
                      ₩{item.priceKRW.toLocaleString()} × {item.quantity}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateQuantity(i, item.quantity - 1)} className="px-2 text-gray-500 hover:text-gray-800">−</button>
                      <span className="px-2 text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(i, item.quantity + 1)} className="px-2 text-gray-500 hover:text-gray-800">+</button>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-xs text-rose-500 hover:underline">Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            {cart.length > 0 && discountPercent === 0 && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-lg p-2">
                {itemsNeededForDiscount > 0 && itemsNeededForDiscount <= 3 ? (
                  <>Tambah {itemsNeededForDiscount} item lagi untuk dapat diskon 5%! 🎉</>
                ) : amountNeededForDiscount > 0 ? (
                  <>Tambah {formatIdr(amountNeededForDiscount)} lagi untuk dapat diskon 7%! 🎉</>
                ) : null}
              </div>
            )}

            {cart.length > 0 && shippingOptions.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600">Shipping method</p>
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="shipping-option"
                      value={option.id}
                      checked={selectedShippingId === option.id}
                      onChange={() => setSelectedShippingId(option.id)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t pt-3 space-y-1 text-sm">
                {selectedShippingOption && (
                  <p className="text-xs text-gray-400">
                    {selectedShippingOption.type === 'hand-carry'
                      ? 'Termasuk jastip fee'
                      : 'Belum termasuk warehouse fee'}
                  </p>
                )}

                <div className="flex justify-between font-bold text-base pt-2 border-t mt-1">
                  <div>
                    <div>TOTAL PRICE</div>
                    <div className="text-xs font-normal text-gray-400">(Ongkir/shipping dibayar terpisah — COD)</div>
                  </div>
                  <span className="flex items-center gap-2">
                    {discountPercent > 0 && (
                      <>
                        <span className="text-xs text-gray-400 line-through font-normal">{formatIdr(originalTotal)}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                          -{Math.round(discountPercent * 100)}%
                        </span>
                      </>
                    )}
                    <span>{formatIdr(grandTotal)}</span>
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleProceedToOrder}
              disabled={cart.length === 0 || !selectedShippingId}
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
          shippingOptionId={selectedShippingId}
          shippingOptionLabel={selectedShippingLabel}
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
