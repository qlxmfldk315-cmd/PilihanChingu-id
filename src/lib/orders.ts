import { supabase } from './supabase'

export interface OrderItemInput {
  name: string
  priceKRW: number
  quantity: number
  url?: string
  image?: string
}

export interface ShippingOption {
  id: string
  label: string
  type: 'hand-carry' | 'go'
  is_active: boolean
  sort_order: number
}

export interface NewOrder {
  customerName: string
  whatsappNumber: string
  items: Array<OrderItemInput>
  subtotalIdr: number
  totalIdr: number
  shippingOptionId: string
  shippingOptionLabel: string
  notes?: string
}

export interface Order {
  id: string
  created_at: string
  customer_name: string
  whatsapp_number: string
  items: Array<OrderItemInput>
  subtotal_idr: number
  total_idr: number
  shipping_option_id: string
  shipping_option_label: string
  notes: string | null
  weight_grams: number | null
  local_shipping_cost_idr: number
  third_party_shipping_cost_idr: number
  shipping_charged_idr: number
  payment_status: 'unpaid' | 'paid' | 'refunded'
  invoice_number: string | null
}

export interface OrderFinanceUpdate {
  weight_grams?: number | null
  local_shipping_cost_idr?: number
  third_party_shipping_cost_idr?: number
  shipping_charged_idr?: number
  payment_status?: 'unpaid' | 'paid' | 'refunded'
}

export async function insertOrder(order: NewOrder) {
  const { error } = await supabase.from('orders').insert({
    customer_name: order.customerName,
    whatsapp_number: order.whatsappNumber,
    items: order.items,
    subtotal_idr: order.subtotalIdr,
    total_idr: order.totalIdr,
    shipping_option_id: order.shippingOptionId,
    shipping_option_label: order.shippingOptionLabel,
    notes: order.notes || null,
  })
  return { error }
}

export async function fetchShippingOptions() {
  const { data, error } = await supabase
    .from('shipping_options')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return { data: (data as ShippingOption[]) || [], error }
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: (data as Order[]) || [], error }
}

export async function updateOrderFinance(orderId: string, updates: OrderFinanceUpdate) {
  const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
  return { error }
}