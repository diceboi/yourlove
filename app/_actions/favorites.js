'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const FAV_COOKIE = 'favorites_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function uuid() { return crypto.randomUUID() }
async function getSupabase() { return await createClient() }

export async function getOrCreateFavoritesToken() {
    const jar = await cookies()
    let token = jar.get(FAV_COOKIE)?.value

    if (!token) {
        token = uuid()
        jar.set(FAV_COOKIE, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        })
    }
    return token
}

export async function toggleFavorite(productId) {
    try {
        const sb = await getSupabase()
        const { data: { user } } = await sb.auth.getUser()
        const token = await getOrCreateFavoritesToken()

        // Check if already favorited
        let query = sb.from('favorites').select('product_id').eq('product_id', productId)

        if (user) {
            query = query.eq('user_id', user.id)
        } else {
            query = query.eq('session_token', token)
        }

        const { data: existing, error: fetchError } = await query.maybeSingle()

        if (fetchError) throw fetchError

        if (existing) {
            // Remove by composite key
            let delQuery = sb.from('favorites').delete().eq('product_id', productId)
            if (user) {
                delQuery = delQuery.eq('user_id', user.id)
            } else {
                delQuery = delQuery.eq('session_token', token)
            }

            const { error: delError } = await delQuery
            if (delError) throw delError
            return { ok: true, isFavorite: false }
        } else {
            // Add
            const payload = {
                product_id: productId,
            }
            if (user) {
                payload.user_id = user.id
            } else {
                payload.session_token = token
            }

            const { error: insError } = await sb.from('favorites').insert(payload)
            if (insError) throw insError
            return { ok: true, isFavorite: true }
        }
    } catch (e) {
        console.error('toggleFavorite error:', e)
        return { ok: false, message: e.message }
    }
}

export async function getIsFavorite(productId) {
    try {
        const sb = await getSupabase()
        const { data: { user } } = await sb.auth.getUser()
        const jar = await cookies()
        const token = jar.get(FAV_COOKIE)?.value

        if (!token && !user) return false

        let query = sb.from('favorites').select('product_id').eq('product_id', productId)

        if (user) {
            query = query.eq('user_id', user.id)
        } else {
            query = query.eq('session_token', token)
        }

        const { data, error } = await query.maybeSingle()
        if (error) return false
        return !!data
    } catch (e) {
        return false
    }
}
