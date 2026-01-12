import { NextResponse } from 'next/server'
import { validateCoupon } from '@/app/_actions/coupon'

export async function POST(request) {
    try {
        const { code, orderTotal, shippingCost } = await request.json()

        if (!code) {
            return NextResponse.json(
                { ok: false, message: 'Kuponkód megadása kötelező' },
                { status: 400 }
            )
        }

        if (!orderTotal || orderTotal <= 0) {
            return NextResponse.json(
                { ok: false, message: 'Érvénytelen rendelési érték' },
                { status: 400 }
            )
        }

        const result = await validateCoupon(code, orderTotal, shippingCost || 0)

        if (!result.ok) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: 'Szerver hiba történt' },
            { status: 500 }
        )
    }
}
