import 'server-only'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function getCartWithItemsRSC() {
  const sb = await createClient()
  const token = (await cookies()).get('cart_token')?.value
  if (!token) return { cart: null, items: [] }

  const { data: cart } = await sb
    .from('carts')
    .select('id, currency, status')
    .eq('cart_token', token)
    .maybeSingle()
  if (!cart) return { cart: null, items: [] }

  // 👇 products JOIN: fo_cim, alcim, termekkep
  const { data: items, error } = await sb
    .from('cart_items')
    .select(`
      id, cart_id, product_id, qty, unit_price,
      product:products (
        id, fo_cim, alcim, termekkep
      )
    `)
    .eq('cart_id', cart.id)

  if (error) {
    // fallback join nélkül, ha bármiért hibázna
    const { data: plain } = await sb
      .from('cart_items')
      .select('id, cart_id, product_id, qty, unit_price')
      .eq('cart_id', cart.id)
    return { cart, items: plain || [] }
  }

  return { cart, items: items || [] }
}
