// app/api/favorites/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireUser } from '../_utils/auth'

function toInt(v) {
  if (v == null) return null
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

export async function GET() {
  const { user, supabase, resp } = await requireUser()
  // if (!user) return resp // REMOVED for guest support

  let query = supabase
    .from('favorites')
    .select(`
      product_id,
      created_at,
      products:product_id (
        id,
        fo_cim,
        alcim,
        eladasi_ar_brutto,
        akcios_ar_brutto,
        akcio_szazalek,
        akcio_ar,
        termekkep
      )
    `)
    .order('created_at', { ascending: false })

  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    // Guest check
    const jar = await cookies()
    const token = jar.get('favorites_token')?.value
    if (!token) return NextResponse.json([])
    query = query.eq('session_token', token)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const out = (data || []).map(row => {
    const p = row.products || {}
    const name = [p.fo_cim, p.alcim].filter(Boolean).join(' ') || 'Termék'
    const price = computeUnitPrice(p) ?? 0
    return {
      id: p.id || row.product_id,
      name,
      price,
      image: p.termekkep,
    }
  })

  return NextResponse.json(out)
}
