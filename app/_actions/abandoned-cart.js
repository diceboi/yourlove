'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from "resend"
import AbandonedCartEmail from '../../emails/AbandonedCartEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Ellenőrzi az elhagyott kosarakat és emailt küld
 * @returns {Promise<{ok: boolean, sent: number, errors: number}>}
 */
export async function checkAbandonedCarts() {
    const sb = await createClient()

    try {
        // 24 órával ezelőtti időpont (teszthez 2 perc)
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setMinutes(twentyFourHoursAgo.getMinutes() - 2)

        // Elhagyott kosarak lekérdezése
        const { data: abandonedCarts, error } = await sb
            .from('carts')
            .select('id, user_id, updated_at, abandoned_email_sent')
            .not('user_id', 'is', null)
            .lte('updated_at', twentyFourHoursAgo.toISOString())
            .is('abandoned_email_sent', false)

        if (error) {
            console.error('Hiba az elhagyott kosarak lekérdezésekor:', error)
            return { ok: false, sent: 0, errors: 1 }
        }

        if (!abandonedCarts || abandonedCarts.length === 0) {
            console.log('Nincs elhagyott kosár')
            return { ok: true, sent: 0, errors: 0 }
        }

        console.log(`${abandonedCarts.length} elhagyott kosár találva`)

        let sentCount = 0
        let errorCount = 0

        // Minden elhagyott kosárhoz
        for (const cart of abandonedCarts) {
            try {
                // Felhasználó adatainak lekérdezése
                const { data: userProfile, error: userError } = await sb
                    .from('user_profiles')
                    .select('email, firstname, lastname')
                    .eq('id', cart.user_id)
                    .single()

                if (userError || !userProfile) {
                    console.error(`Nincs user profile a(z) ${cart.user_id} user_id-hoz`)
                    continue
                }

                // Kosár tételeinek lekérdezése
                const { data: cartItems, error: itemsError } = await sb
                    .from('cart_items')
                    .select(`
            id,
            qty,
            unit_price_huf,
            product:products (
              id,
              fo_cim,
              alcim
            )
          `)
                    .eq('cart_id', cart.id)

                if (itemsError || !cartItems || cartItems.length === 0) {
                    // Ha nincs termék a kosárban, jelöljük meg és ugorjunk tovább
                    await sb
                        .from('carts')
                        .update({ abandoned_email_sent: true })
                        .eq('id', cart.id)
                    continue
                }

                // Email küldés
                const userName = userProfile.firstname && userProfile.lastname
                    ? `${userProfile.lastname} ${userProfile.firstname}`
                    : userProfile.firstname || userProfile.email.split('@')[0]

                const items = cartItems.map(item => ({
                    id: item.product.id,
                    name: [item.product.fo_cim, item.product.alcim].filter(Boolean).join(' '),
                    qty: item.qty,
                    price: item.unit_price_huf,
                }))

                const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)

                console.log(`Email küldése: ${userProfile.email}, ${items.length} termék, ${total} Ft`)

                await resend.emails.send({
                    from: "YourLove <info@yourlove.hu>",
                    to: userProfile.email,
                    subject: `Ne felejts el vásárolni! 🛍️`,
                    react: AbandonedCartEmail({
                        name: userName,
                        items,
                        total,
                        cartUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourlove.hu'}/kosar`,
                    }),
                })

                // Jelöljük meg, hogy email elküldve
                await sb
                    .from('carts')
                    .update({
                        abandoned_email_sent: true,
                        abandoned_email_sent_at: new Date().toISOString(),
                    })
                    .eq('id', cart.id)

                console.log(`✅ Email sikeresen elküldve: ${userProfile.email}`)
                sentCount++

            } catch (err) {
                console.error(`Hiba a(z) ${cart.id} kosár emailjének küldésekor:`, err)
                errorCount++
            }
        }

        return { ok: true, sent: sentCount, errors: errorCount }

    } catch (err) {
        console.error('Váratlan hiba az elhagyott kosarak ellenőrzésekor:', err)
        return { ok: false, sent: 0, errors: 1 }
    }
}
