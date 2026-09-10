import { supabase } from './supabase'

export interface OrderItemInput {
  name: string
  priceKRW: number
  url?: string
}

export interface NewOrder {
  customerName: string
  whatsappNumber: string
  items: Array<OrderItemInput>
  subtotalIdr: number
  totalIdr: number
  notes?: string
}

export async function insertOrder(order: NewOrder) {
  const { error } = await supabase.from('orders').insert({
    customer_name: order.customerName,
    whatsapp_number: order.whatsappNumber,
    items: order.items,
    subtotal_idr: order.subtotalIdr,
    total_idr: order.totalIdr,
    notes: order.notes || null,
  })
  return { error }
}