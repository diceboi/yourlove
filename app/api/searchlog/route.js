// nincs TS
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req) {
  try {
    const { term } = await req.json()
    const t = String(term || '').trim()
    if (!t) return NextResponse.json({ ok: true })
    const supabase = await createClient()

    // opcionális: user azonosítás (ha van auth)
    const { data: { user } } = await supabase.auth.getUser().catch(()=>({ data:{user:null} }))

    const { error } = await supabase
      .from('search_logs')
      .insert({ term: t, user_id: user?.id ?? null })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    // nem dobunk 500-at a kliensnek, csak log
    console.error('/api/searchlog POST error', e)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
