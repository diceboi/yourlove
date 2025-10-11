'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// a te olvasód: token->cart->items
async function getCartAndItems(sb) {
  const token = (await cookies()).get('cart_token')?.value
  if (!token) return { cart: null, items: [] }

  const { data: cart } = await sb
    .from('carts')
    .select('id, currency, status')
    .eq('cart_token', token)
    .maybeSingle()
  if (!cart) return { cart: null, items: [] }

  const { data: items } = await sb
    .from('cart_items')
    .select('id, cart_id, product_id, qty, unit_price')
    .eq('cart_id', cart.id)

  return { cart, items: items || [] }
}

export async function createOrderFromCart(customer) {
  try {
    const sb = await createClient()
    const { cart, items } = await getCartAndItems(sb)
    if (!cart || !items?.length) {
      return { ok: false, message: 'A kosár üres.' }
    }

    // hozzuk le a termék snapshot mezőit
    const ids = [...new Set(items.map(i => i.product_id))]
    const { data: products } = await sb
      .from('products')
      .select('id, fo_cim, alcim, termekkep')
      .in('id', ids)

    const byId = new Map((products || []).map(p => [p.id, p]))
    const subtotal = items.reduce((s, it) => s + (it.unit_price || 0) * (it.qty || 0), 0)

    // 1) order
    const { data: order, error: oErr } = await sb
      .from('orders')
      .insert({
        cart_id: cart.id,
        status: 'draft',
        currency: cart.currency || 'HUF',
        subtotal_huf: subtotal,
        total_huf: subtotal, // itt később szállítás/kupon stb.
        // opcionális: customer adatok JSON-ben
        // customer_json: customer ? JSON.stringify(customer) : null
      })
      .select('id')
      .single()
    if (oErr) return { ok: false, message: oErr.message }

    // 2) order_items snapshot
    const rows = items.map(it => {
      const p = byId.get(it.product_id)
      const name = p ? [p.fo_cim, p.alcim].filter(Boolean).join(' ') : 'Termék'
      const image_url = p?.termekkep || null
      return {
        order_id: order.id,
        product_id: it.product_id,
        name,
        image_url,
        qty: it.qty,
        unit_price_huf: it.unit_price,
      }
    })

    const { error: oiErr } = await sb.from('order_items').insert(rows)
    if (oiErr) return { ok: false, message: oiErr.message }

    // 3) cart státusz frissítése (opcionális, akkor is látod utólag)
    await sb.from('carts').update({ status: 'converted' }).eq('id', cart.id)

    return { ok: true, orderId: order.id }
  } catch (e) {
    return { ok: false, message: e?.message || 'Ismeretlen hiba' }
  }
}
