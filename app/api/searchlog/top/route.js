import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const days = Math.max(1, parseInt(searchParams.get('days') || '30', 10))
    const limit = Math.max(1, Math.min(20, parseInt(searchParams.get('limit') || '10', 10)))

    const since = new Date()
    since.setDate(since.getDate() - days)

    const supabase = await createClient()

    // Lehúzzuk a logokat és Node-ban aggregálunk (gyors javítás).
    const { data, error } = await supabase
      .from('search_logs')
      .select('term, created_at')
      .gte('created_at', since.toISOString())
      .limit(10000) // ha nagyon sok a log, ezt emelheted és/vagy időablakot szűkíthetsz

    if (error) throw error

    const counter = new Map()
    for (const r of data || []) {
      const t = String(r.term || '').trim()
      if (!t) continue
      counter.set(t, (counter.get(t) || 0) + 1)
    }

    const top = [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term]) => term)

    return NextResponse.json({ top })
  } catch (e) {
    console.error('/api/searchlog/top GET error', e)
    return NextResponse.json({ top: [] }, { status: 200 })
  }
}
