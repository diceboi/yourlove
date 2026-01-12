'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Termék vélemények lekérdezése (publikus)
 */
export async function getProductReviews(productId, options = {}) {
    const {
        limit = 10,
        offset = 0,
        onlyApproved = true,
        minRating = null,
        orderBy = 'created_at',
        orderDirection = 'desc'
    } = options

    const sb = await createClient()

    let query = sb
        .from('product_reviews')
        .select(`
      id,
      rating,
      title,
      review_text,
      is_verified_purchase,
      is_featured,
      created_at,
      reviewer_name,
      user_profiles!product_reviews_user_id_fkey (
        firstname,
        lastname
      )
    `, { count: 'exact' })
        .eq('product_id', productId)

    if (onlyApproved) {
        query = query.eq('is_approved', true)
    }

    if (minRating) {
        query = query.gte('rating', minRating)
    }

    query = query.order(orderBy, { ascending: orderDirection === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('Hiba a vélemények lekérdezésekor:', error)
        return { ok: false, data: [], total: 0, error: error.message }
    }

    // Calculate rating distribution
    const distribution = await Promise.all([5, 4, 3, 2, 1].map(async rating => {
        const { count: ratingCount } = await sb
            .from('product_reviews')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', productId)
            .eq('is_approved', true)
            .eq('rating', rating)

        return { rating, count: ratingCount || 0 }
    }))

    return {
        ok: true,
        data: data || [],
        total: count || 0,
        distribution
    }
}

/**
 * Új vélemény küldése
 */
export async function submitReview(reviewData) {
    const sb = await createClient()

    try {
        // User ellenőrzés
        const { data: { user } } = await sb.auth.getUser()

        // Ellenőrzés: egy user csak 1 véleményt írhat termékhez
        if (user) {
            const { data: existing } = await sb
                .from('product_reviews')
                .select('id')
                .eq('product_id', reviewData.productId)
                .eq('user_id', user.id)
                .single()

            if (existing) {
                return { ok: false, error: 'Már írtál véleményt erről a termékről' }
            }
        }

        // Ellenőrzött vásárlás check (ha user_id van)
        let isVerifiedPurchase = false
        let orderId = null

        if (user) {
            const { data: order } = await sb
                .from('order_items')
                .select('order_id, orders!inner(user_id, status)')
                .eq('product_id', reviewData.productId)
                .eq('orders.user_id', user.id)
                .in('orders.status', ['paid', 'shipped', 'delivered'])
                .limit(1)
                .maybeSingle()

            if (order) {
                isVerifiedPurchase = true
                orderId = order.order_id
            }
        }

        // Vélemény beszúrása
        const { data: review, error } = await sb
            .from('product_reviews')
            .insert({
                product_id: reviewData.productId,
                user_id: user?.id || null,
                order_id: orderId,
                rating: reviewData.rating,
                title: reviewData.title || null,
                review_text: reviewData.reviewText,
                reviewer_name: user ? null : reviewData.reviewerName,
                reviewer_email: user ? null : reviewData.reviewerEmail,
                is_verified_purchase: isVerifiedPurchase,
                is_approved: false // Admin jóváhagyásra vár
            })
            .select()
            .single()

        if (error) {
            console.error('Hiba a vélemény mentésekor:', error)
            return { ok: false, error: error.message }
        }

        revalidatePath(`/p/[slug]`, 'page')
        return { ok: true, data: review }

    } catch (err) {
        console.error('Váratlan hiba a vélemény küldésekor:', err)
        return { ok: false, error: 'Váratlan hiba történt' }
    }
}

/**
 * Admin: Összes vélemény lekérdezése szűrőkkel
 */
export async function getAllReviews(filters = {}, pagination = {}) {
    const {
        status = 'all', // 'all' | 'pending' | 'approved' | 'rejected'
        productId = null,
        minRating = null,
        search = null
    } = filters

    const {
        limit = 20,
        offset = 0
    } = pagination

    const sb = await createClient()

    let query = sb
        .from('product_reviews')
        .select(`
      id,
      rating,
      title,
      review_text,
      is_approved,
      is_featured,
      is_verified_purchase,
      created_at,
      reviewer_name,
      reviewer_email,
      user_profiles!product_reviews_user_id_fkey (
        firstname,
        lastname,
        email
      ),
      products (
        id,
        fo_cim,
        seo_slug,
        kategoria,
        canonical_path
      )
    `, { count: 'exact' })

    if (status === 'pending') {
        query = query.eq('is_approved', false)
    } else if (status === 'approved') {
        query = query.eq('is_approved', true)
    }

    if (productId) {
        query = query.eq('product_id', productId)
    }

    if (minRating) {
        query = query.gte('rating', minRating)
    }

    if (search) {
        query = query.or(`review_text.ilike.%${search}%,title.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('Hiba az admin vélemények lekérdezésekor:', error)
        return { ok: false, data: [], total: 0, error: error.message }
    }

    return { ok: true, data: data || [], total: count || 0 }
}

/**
 * Admin: Vélemény jóváhagyása
 */
export async function approveReview(reviewId) {
    const sb = await createClient()

    try {
        const { data: { user } } = await sb.auth.getUser()

        if (!user) {
            return { ok: false, error: 'Nincs bejelentkezve' }
        }

        const { data, error } = await sb
            .from('product_reviews')
            .update({
                is_approved: true,
                moderated_by: user.id,
                moderated_at: new Date().toISOString()
            })
            .eq('id', reviewId)
            .select('product_id')
            .single()

        if (error) {
            console.error('Hiba a vélemény jóváhagyásakor:', error)
            return { ok: false, error: error.message }
        }

        // Trigger automatikusan frissíti a termék statisztikákat
        revalidatePath('/admin/velemenyek')
        revalidatePath(`/p/[slug]`, 'page')

        return { ok: true, data }

    } catch (err) {
        console.error('Váratlan hiba:', err)
        return { ok: false, error: 'Váratlan hiba történt' }
    }
}

/**
 * Admin: Vélemény elutasítása (törlés)
 */
export async function rejectReview(reviewId) {
    const sb = await createClient()

    try {
        const { error } = await sb
            .from('product_reviews')
            .delete()
            .eq('id', reviewId)

        if (error) {
            console.error('Hiba a vélemény törlésekor:', error)
            return { ok: false, error: error.message }
        }

        revalidatePath('/admin/velemenyek')
        return { ok: true }

    } catch (err) {
        console.error('Váratlan hiba:', err)
        return { ok: false, error: 'Váratlan hiba történt' }
    }
}

/**
 * Admin: Vélemény kiemelt jelölés váltása
 */
export async function toggleFeatureReview(reviewId, isFeatured) {
    const sb = await createClient()

    try {
        const { error } = await sb
            .from('product_reviews')
            .update({ is_featured: isFeatured })
            .eq('id', reviewId)

        if (error) {
            console.error('Hiba a kiemelt jelöléskor:', error)
            return { ok: false, error: error.message }
        }

        revalidatePath('/admin/velemenyek')
        revalidatePath(`/p/[slug]`, 'page')
        return { ok: true }

    } catch (err) {
        console.error('Váratlan hiba:', err)
        return { ok: false, error: 'Váratlan hiba történt' }
    }
}

/**
 * Termék rating statisztikák manuális frissítése
 * (A trigger automatikusan csinálja, de manuálisan is hívható)
 */
export async function updateProductRatingStats(productId) {
    const sb = await createClient()

    try {
        // Call the database function
        const { error } = await sb.rpc('update_product_review_stats', {
            p_product_id: productId
        })

        if (error) {
            console.error('Hiba a statisztikák frissítésekor:', error)
            return { ok: false, error: error.message }
        }

        revalidatePath(`/p/[slug]`, 'page')
        return { ok: true }

    } catch (err) {
        console.error('Váratlan hiba:', err)
        return { ok: false, error: 'Váratlan hiba történt' }
    }
}
