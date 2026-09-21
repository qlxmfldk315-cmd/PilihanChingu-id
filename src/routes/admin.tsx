import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { fetchOrders, updateOrderFinance } from '@/lib/orders'
import type { Order, OrderFinanceUpdate } from '@/lib/orders'
import { formatIdr } from '@/lib/format'

export const Route = createFileRoute('/admin')({
  component: Admin,
})

function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadOrders()
  }, [session])

  const loadOrders = async () => {
    setLoadingOrders(true)
    const { data } = await fetchOrders()
    setOrders(data)
    setLoadingOrders(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoggingIn(false)
    if (error) setLoginError('Invalid email or password.')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOrders([])
  }

  const updateLocalOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }

  const handleSave = async (order: Order) => {
    setSavingId(order.id)
    const updates: OrderFinanceUpdate = {
      weight_grams: order.weight_grams,
      local_shipping_cost_idr: order.local_shipping_cost_idr,
      third_party_shipping_cost_idr: order.third_party_shipping_cost_idr,
      shipping_charged_idr: order.shipping_charged_idr,
      payment_status: order.payment_status,
    }
    await updateOrderFinance(order.id, updates)
    setSavingId(null)
  }

  const feeRevenue = (o: Order) => o.total_idr - o.subtotal_idr
  const shippingProfit = (o: Order) =>
    o.shipping_charged_idr - o.local_shipping_cost_idr - o.third_party_shipping_cost_idr
  const netProfit = (o: Order) => feeRevenue(o) + shippingProfit(o)

  const totals = orders.reduce(
    (acc, o) => {
      acc.feeRevenue += feeRevenue(o)
      acc.shippingProfit += shippingProfit(o)
      acc.netProfit += netProfit(o)
      return acc
    },
    { feeRevenue: 0, shippingProfit: 0, netProfit: 0 }
  )

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl border w-full max-w-sm space-y-3">
          <h1 className="text-lg font-bold">Admin Login</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-2 border rounded text-sm"
          />
          {loginError && <p className="text-xs text-red-500">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-rose-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loggingIn ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Order & Finance Dashboard</h1>
          <button onClick={handleLogout} className="text-sm text-rose-500 hover:underline">
            Log out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Total jastip fee revenue</p>
            <p className="text-lg font-bold">{formatIdr(totals.feeRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Total shipping profit</p>
            <p className="text-lg font-bold">{formatIdr(totals.shippingProfit)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Total net profit</p>
            <p className="text-lg font-bold text-green-600">{formatIdr(totals.netProfit)}</p>
          </div>
        </div>

        {loadingOrders ? (
          <p className="text-sm text-gray-500">Loading orders…</p>
        ) : (
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Invoice</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Shipping</th>
                  <th className="p-2">Subtotal</th>
                  <th className="p-2">Fee revenue</th>
                  <th className="p-2">Weight (g)</th>
                  <th className="p-2">Local ship cost</th>
                  <th className="p-2">3rd-party cost</th>
                  <th className="p-2">Charged to customer</th>
                  <th className="p-2">Net profit</th>
                  <th className="p-2">Status</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-2 whitespace-nowrap">{o.invoice_number}</td>
                    <td className="p-2 whitespace-nowrap">
                      {o.customer_name}
                      <br />
                      <span className="text-xs text-gray-400">{o.whatsapp_number}</span>
                    </td>
                    <td className="p-2 whitespace-nowrap">{o.shipping_option_label}</td>
                    <td className="p-2 whitespace-nowrap">{formatIdr(o.subtotal_idr)}</td>
                    <td className="p-2 whitespace-nowrap">{formatIdr(feeRevenue(o))}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={o.weight_grams ?? ''}
                        onChange={(e) => updateLocalOrder(o.id, { weight_grams: Number(e.target.value) })}
                        className="w-20 p-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={o.local_shipping_cost_idr}
                        onChange={(e) => updateLocalOrder(o.id, { local_shipping_cost_idr: Number(e.target.value) })}
                        className="w-24 p-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={o.third_party_shipping_cost_idr}
                        onChange={(e) => updateLocalOrder(o.id, { third_party_shipping_cost_idr: Number(e.target.value) })}
                        className="w-24 p-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={o.shipping_charged_idr}
                        onChange={(e) => updateLocalOrder(o.id, { shipping_charged_idr: Number(e.target.value) })}
                        className="w-24 p-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2 whitespace-nowrap font-semibold">{formatIdr(netProfit(o))}</td>
                    <td className="p-2">
                      <select
                        value={o.payment_status}
                        onChange={(e) =>
                          updateLocalOrder(o.id, { payment_status: e.target.value as Order['payment_status'] })
                        }
                        className="p-1 border rounded text-xs"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="p-2 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleSave(o)}
                        disabled={savingId === o.id}
                        className="text-xs bg-rose-500 text-white px-2 py-1 rounded disabled:opacity-50"
                      >
                        {savingId === o.id ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setInvoiceOrder(o)}
                        className="text-xs bg-gray-900 text-white px-2 py-1 rounded"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:bg-white print:static">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-3 max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-none">
            <div className="flex justify-between items-center print:hidden">
              <h2 className="text-lg font-bold">Invoice {invoiceOrder.invoice_number}</h2>
              <button onClick={() => setInvoiceOrder(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p className="font-bold text-base">PilihanChingu.id</p>
              <p>Invoice: {invoiceOrder.invoice_number}</p>
              <p>Customer: {invoiceOrder.customer_name}</p>
              <p>WhatsApp: {invoiceOrder.whatsapp_number}</p>
              <p>Shipping: {invoiceOrder.shipping_option_label}</p>
            </div>

            <div className="border-t pt-2 space-y-1 text-sm">
              {invoiceOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₩{(item.priceKRW * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal (item)</span>
                <span>{formatIdr(invoiceOrder.subtotal_idr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Jastip fee</span>
                <span>{formatIdr(feeRevenue(invoiceOrder))}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Item total</span>
                <span>{formatIdr(invoiceOrder.total_idr)}</span>
              </div>
            </div>

            {invoiceOrder.shipping_charged_idr > 0 && (
              <div className="border-t pt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Shipping (COD)</span>
                  <span>{formatIdr(invoiceOrder.shipping_charged_idr)}</span>
                </div>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Grand total</span>
              <span>{formatIdr(invoiceOrder.total_idr + invoiceOrder.shipping_charged_idr)}</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-rose-500 text-white py-2 rounded-lg font-semibold print:hidden"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
