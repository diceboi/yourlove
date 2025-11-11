import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    // Kód → session (PKCE)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // ide tehetsz logolást vagy hibaoldalra dobást
      return NextResponse.redirect(`${origin}/hiba`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
