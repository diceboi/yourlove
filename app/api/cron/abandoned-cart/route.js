import { NextResponse } from 'next/server'
import { checkAbandonedCarts } from '@/app/_actions/abandoned-cart'

/**
 * Cron job endpoint az elhagyott kosarak ellenőrzésére
 * Vercel Cron vagy külső szolgáltatás hívhatja
 */
export async function GET(request) {
    try {
        // Authentication token ellenőrzés (production only)
        if (process.env.NODE_ENV !== 'development') {
            const authHeader = request.headers.get('authorization')
            const expectedToken = process.env.CRON_SECRET

            if (!expectedToken) {
                return NextResponse.json(
                    { error: 'Cron secret not configured' },
                    { status: 500 }
                )
            }

            if (authHeader !== `Bearer ${expectedToken}`) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                )
            }
        }

        // Elhagyott kosarak ellenőrzése és email küldés
        const result = await checkAbandonedCarts()

        return NextResponse.json({
            success: result.ok,
            emailsSent: result.sent,
            errors: result.errors,
            timestamp: new Date().toISOString(),
        })

    } catch (error) {
        console.error('Hiba a cron job futtatásakor:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
