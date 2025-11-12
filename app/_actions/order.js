'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getOrCreateCart } from '@/app/_actions/cart' // már létezik nálad

function toInt(x) {
  if (x == null) return null
  const n = Number(String(x).replace(/\s+/g,'').replace(',','.'))
  return Number.isFinite(n) ? Math.round(n) : null
}

export async function createOrderFromCart(payload) {
  const sb = await createClient()

  // 1) user beolvasása (ha van session)
  const { data: { user } } = await sb.auth.getUser().catch(() => ({ data: { user: null }}))

  // 2) aktív kosár (cookie alapján)
  const cart = await getOrCreateCart()

  // ha bejelentkezett és még nincs hozzákötve a kosár:
  if (user && !cart.user_id) {
    await sb.from('carts')
      .update({ user_id: user.id })
      .eq('id', cart.id)
      .is('user_id', null) // csak ha tényleg null
  }

  // 3) kosár tételek
  const { data: items, error: ciErr } = await sb
    .from('cart_items')
    .select('id, product_id, qty, unit_price_huf')
    .eq('cart_id', cart.id)

  if (ciErr) return { ok: false, message: ciErr.message }
  if (!items?.length) return { ok: false, message: 'A kosár üres.' }

  const lines = items.map(it => ({
    product_id: it.product_id,
    qty: toInt(it.qty) || 1,
    unit_price_huf: toInt(it.unit_price_huf) || 0,
    line_total_huf: (toInt(it.unit_price_huf) || 0) * (toInt(it.qty) || 1),
  }))
  const order_total = lines.reduce((s, l) => s + l.line_total_huf, 0)

  // 4) rendelés létrehozása
  const orderRow = {
    user_id: user?.id ?? null,
    cart_id: cart.id,                           // << új
    status: 'processing',
    currency: 'HUF',
    email: payload.email,
    phone: payload.phone,
    customer_lastname: payload.lastname,
    customer_firstname: payload.firstname,
    shipping_method: payload.shipping || null,
    billing_zip: payload.zip,
    billing_city: payload.city,
    billing_address: [payload.address, payload.address_extra].filter(Boolean).join(', '),
    notes: payload.notes || null,
    total_huf: order_total,
  };

  const { data: created, error: oErr } = await sb
    .from('orders')
    .insert(orderRow)
    .select('id') // vissza az id
    .single()

  if (oErr) return { ok: false, message: oErr.message }

  // 5) order_items beszúrás
  const oiRows = lines.map(l => ({
    order_id: created.id,
    product_id: l.product_id,
    qty: l.qty,
    unit_price_huf: l.unit_price_huf,
    vat_rate: 27,                    // ha van rá meződ; állítsd, amire kell
  }))

  const { error: oiErr } = await sb.from('order_items').insert(oiRows)
  if (oiErr) return { ok: false, message: oiErr.message }

  // 6) kosár lezárása
  await sb.from('carts').update({ status: 'converted' }).eq('id', cart.id); // << 'ordered' helyett
  await sb.from('cart_items').delete().eq('cart_id', cart.id);

  // (opcionális) rendelés szám generálás, e-mail, stb…

  return { ok: true, orderId: created.id }
}
