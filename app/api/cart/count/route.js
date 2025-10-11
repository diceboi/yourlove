// SERVER (route handler)
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic' // ne cache-elje

export async function GET() {
  try {
    const sb = await createClient()
    const token = (await cookies()).get('cart_token')?.value
    if (!token) return NextResponse.json({ count: 0 }, { headers: { 'Cache-Control': 'no-store' } })

    const { data: cart } = await sb
      .from('carts')
      .select('id')
      .eq('cart_token', token)
      .maybeSingle()
    if (!cart) return NextResponse.json({ count: 0 }, { headers: { 'Cache-Control': 'no-store' } })

    const { data: items } = await sb
      .from('cart_items')
      .select('qty')
      .eq('cart_id', cart.id)

    const count = (items || []).reduce((s, it) => s + (it.qty || 0), 0)
    return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json({ count: 0 }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  }
}
