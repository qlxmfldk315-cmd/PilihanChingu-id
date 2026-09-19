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