// app/_actions/cart.js
'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const CART_COOKIE = 'cart_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function uuid() { return crypto.randomUUID() }
async function getSupabase() { return await createClient() }

export async function getOrCreateCart() {
  const sb = await getSupabase()
  const jar = await cookies()
  let token = jar.get(CART_COOKIE)?.value

  if (token) {
    const { data } = await sb
      .from('carts')
      .select('id,status,currency')
      .eq('cart_token', token)
      .eq('status','active')
      .maybeSingle()
    if (data) return data
  }

  const newToken = uuid()
  const { data: cart, error } = await sb
    .from('carts')
    .insert({ cart_token: newToken })
    .select('id,status,currency')
    .single()
  if (error) throw error

  ;(await cookies()).set(CART_COOKIE, newToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return cart
}

// robusztus konvertálás: szám/string -> egész HUF
function toInt(v) {
  if (v == null) return null
  // engedjük a "1 990", "1.990", "1,990", "1990.0" formákat is
  const s = String(v).replace(/\s+/g, '').replace(',', '.')
  const n = Number.parseFloat(s)
  if (!Number.isFinite(n)) return null
  return Math.round(n)
}

function computeUnitPrice(p) {
  const base = toInt(p.eladasi_ar_brutto)
  const promoFixed = toInt(p.akcios_ar_brutto)
  const discountPercent = toInt(p.akcio_szazalek)
  const discountFixed = toInt(p.akcio_ar)

  if (promoFixed && promoFixed > 0) return promoFixed
  if (base && discountPercent && discountPercent > 0) {
    return Math.max(0, Math.round(base * (100 - discountPercent) / 100))
  }
  if (base && discountFixed && discountFixed > 0) {
    return Math.max(0, base - discountFixed)
  }
  return base ?? null
}

export async function addToCart(productId, qty = 1) {
  try {
    const sb = await getSupabase()
    const cart = await getOrCreateCart()

    // csak a szükséges mezők a pricinghez
    const { data: product, error: pErr } = await sb
      .from('products')
      .select('id, eladasi_ar_brutto, akcios_ar_brutto, akcio_szazalek, akcio_ar')
      .eq('id', productId)
      .single()

    if (pErr || !product) {
      console.error('addToCart: product not found', { productId, pErr })
      return { ok: false, message: 'A termék nem található (products.id).' }
    }

    const unit_price = computeUnitPrice(product)
    if (unit_price == null) {
      console.error('addToCart: price missing for product', { productId, product })
      return { ok: false, message: 'A termék ára nem állapítható meg.' }
    }

    // 🔥 Atomikus növelés RPC-vel (qty += bejövő qty)
    const { data: row, error } = await sb.rpc('add_to_cart', {
      p_cart_id: cart.id,
      p_product_id: product.id,
      p_qty: qty,
      p_unit_price: unit_price,
    })

    if (error) {
      console.error('addToCart: rpc error', error)
      return { ok: false, message: error.message }
    }

    return { ok: true, item: row }
  } catch (e) {
    console.error('addToCart: unexpected', e)
    return { ok: false, message: e?.message || 'Ismeretlen hiba' }
  }
}

export async function updateQty(itemId, qty) {
  try {
    const sb = await getSupabase()
    if (qty <= 0) return await removeItem(itemId)
    const { error } = await sb.from('cart_items').update({ qty }).eq('id', itemId)
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e) { return { ok: false, message: e?.message } }
}

export async function removeItem(itemId) {
  try {
    const sb = await getSupabase()
    const { error } = await sb.from('cart_items').delete().eq('id', itemId)
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e) { return { ok: false, message: e?.message } }
}
