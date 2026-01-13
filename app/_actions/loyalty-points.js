'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get user's current points balance
 */
export async function getUserPoints(userId) {
    const sb = await createClient()

    try {
        const { data, error } = await sb
            .from('user_profiles')
            .select('points')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching user points:', error)
            return { ok: false, points: 0, error: error.message }
        }

        return { ok: true, points: data?.points || 0 }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, points: 0, error: 'Unexpected error' }
    }
}

/**
 * Get user's points transaction history
 */
export async function getPointsHistory(userId, pagination = {}) {
    const sb = await createClient()
    const { limit = 20, offset = 0 } = pagination

    try {
        const query = sb
            .from('loyalty_points_transactions')
            .select(`
        *,
        orders (
          order_number
        )
      `, { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching points history:', error)
            return { ok: false, data: [], total: 0, error: error.message }
        }

        return { ok: true, data: data || [], total: count || 0 }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, data: [], total: 0, error: 'Unexpected error' }
    }
}

/**
 * Get points system settings
 */
export async function getPointsSettings() {
    const sb = await createClient()

    try {
        const { data, error } = await sb
            .from('points_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching points settings:', error)
            // Return default settings if none exist
            return {
                ok: true,
                settings: {
                    points_per_currency: 100,
                    minimum_order_value: 0,
                    redemption_rate: 1,
                    is_active: true
                }
            }
        }

        return { ok: true, settings: data }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error' }
    }
}

/**
 * Calculate points for an order
 */
export async function calculatePointsForOrder(orderTotal) {
    const settingsResult = await getPointsSettings()

    if (!settingsResult.ok || !settingsResult.settings.is_active) {
        return { ok: true, points: 0 }
    }

    const { points_per_currency, minimum_order_value } = settingsResult.settings

    // Check minimum order value
    if (orderTotal < minimum_order_value) {
        return { ok: true, points: 0 }
    }

    // Calculate points: orderTotal / points_per_currency
    // Example: 10000 Ft / 100 = 100 points
    const points = Math.floor(orderTotal / points_per_currency)

    return { ok: true, points }
}

/**
 * Award points to user after purchase
 */
export async function awardPoints(userId, orderId, points, description = 'Vásárlás után') {
    const sb = await createClient()

    try {
        if (points <= 0) {
            return { ok: true, message: 'No points to award' }
        }

        // Get current balance
        const currentBalance = await getUserPoints(userId)
        const newBalance = (currentBalance.points || 0) + points

        // Update user balance
        const { error: updateError } = await sb
            .from('user_profiles')
            .update({ points: newBalance })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating user points:', updateError)
            return { ok: false, error: updateError.message }
        }

        // Create transaction record
        const { data, error: transactionError } = await sb
            .from('loyalty_points_transactions')
            .insert({
                user_id: userId,
                order_id: orderId,
                points_earned: points,
                points_spent: 0,
                balance_after: newBalance,
                transaction_type: 'purchase',
                description
            })
            .select()

        if (transactionError) {
            console.error('Error creating transaction:', transactionError)
            return { ok: false, error: transactionError.message }
        }

        return { ok: true, points, newBalance, data }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error' }
    }
}

/**
 * Admin: Manually adjust user points
 */
export async function adjustPoints(userId, pointsChange, reason) {
    const sb = await createClient()

    try {
        // Check if current user is admin
        const { data: { user } } = await sb.auth.getUser()
        if (!user) {
            return { ok: false, error: 'Not authenticated' }
        }

        const { data: currentUserProfile } = await sb
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!currentUserProfile || !['admin', 'superadmin'].includes(currentUserProfile.role)) {
            return { ok: false, error: 'Insufficient permissions' }
        }

        // Get current balance
        const currentBalance = await getUserPoints(userId)
        const newBalance = Math.max(0, (currentBalance.points || 0) + pointsChange)

        // Update user balance
        const { error: updateError } = await sb
            .from('user_profiles')
            .update({ points: newBalance })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating user points:', updateError)
            return { ok: false, error: updateError.message }
        }

        // Create transaction record
        const { data, error: transactionError } = await sb
            .from('loyalty_points_transactions')
            .insert({
                user_id: userId,
                order_id: null,
                points_earned: pointsChange > 0 ? pointsChange : 0,
                points_spent: pointsChange < 0 ? Math.abs(pointsChange) : 0,
                balance_after: newBalance,
                transaction_type: 'admin_adjustment',
                description: reason || 'Admin módosítás'
            })
            .select()

        if (transactionError) {
            console.error('Error creating transaction:', transactionError)
            return { ok: false, error: transactionError.message }
        }

        revalidatePath('/admin/pontok')
        return { ok: true, newBalance, data }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error' }
    }
}

/**
 * Admin: Update points system settings
 */
export async function updatePointsSettings(settings) {
    const sb = await createClient()

    try {
        // Check if current user is admin
        const { data: { user } } = await sb.auth.getUser()
        if (!user) {
            return { ok: false, error: 'Not authenticated' }
        }

        const { data: currentUserProfile } = await sb
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!currentUserProfile || !['admin', 'superadmin'].includes(currentUserProfile.role)) {
            return { ok: false, error: 'Insufficient permissions' }
        }

        // Get existing settings
        const { data: existing } = await sb
            .from('points_settings')
            .select('id')
            .single()

        if (existing) {
            // Update existing
            const { data, error } = await sb
                .from('points_settings')
                .update({
                    ...settings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) {
                console.error('Error updating settings:', error)
                return { ok: false, error: error.message }
            }

            revalidatePath('/admin/pontok')
            return { ok: true, data }
        } else {
            // Create new
            const { data, error } = await sb
                .from('points_settings')
                .insert(settings)
                .select()
                .single()

            if (error) {
                console.error('Error creating settings:', error)
                return { ok: false, error: error.message }
            }

            revalidatePath('/admin/pontok')
            return { ok: true, data }
        }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error' }
    }
}

/**
 * Validate points redemption (before checkout)
 */
export async function validatePointsRedemption(userId, pointsToRedeem) {
    const sb = await createClient()

    try {
        if (!pointsToRedeem || pointsToRedeem <= 0) {
            return { ok: false, error: 'Érvénytelen pontszám' }
        }

        // Get user's current balance
        const balanceResult = await getUserPoints(userId)
        if (!balanceResult.ok) {
            return { ok: false, error: 'Nem sikerült lekérni a pontokat' }
        }

        const currentBalance = balanceResult.points || 0

        // Check if user has enough points
        if (pointsToRedeem > currentBalance) {
            return { ok: false, error: `Nincs elég pontod. Jelenlegi egyenleg: ${currentBalance}` }
        }

        // Get redemption rate
        const settingsResult = await getPointsSettings()
        if (!settingsResult.ok) {
            return { ok: false, error: 'Nem sikerült lekérni a beállításokat' }
        }

        const redemptionRate = settingsResult.settings.redemption_rate || 1

        // Calculate discount amount
        const discountAmount = pointsToRedeem * redemptionRate

        return {
            ok: true,
            pointsToRedeem,
            discountAmount,
            remainingPoints: currentBalance - pointsToRedeem
        }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error' }
    }
}

/**
 * Redeem points (called during order completion)
 */
export async function redeemPoints(userId, orderId, pointsToRedeem, description = 'Pontbeváltás') {
    const sb = await createClient()

    try {
        if (!pointsToRedeem || pointsToRedeem <= 0) {
            return { ok: false, error: 'Invalid points amount' }
        }

        // Validate redemption
        const validation = await validatePointsRedemption(userId, pointsToRedeem)
        if (!validation.ok) {
            return validation
        }

        const newBalance = validation.remainingPoints

        // Update user balance
        const { error: updateError } = await sb
            .from('user_profiles')
            .update({ points: newBalance })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating user points:', updateError)
            return { ok: false, error: updateError.message }
        }

        // Create transaction record
        const { data, error: transactionError } = await sb
            .from('loyalty_points_transactions')
            .insert({
                user_id: userId,
                order_id: orderId,
                points_earned: 0,
                points_spent: pointsToRedeem,
                balance_after: newBalance,
                transaction_type: 'redemption',
                description
            })
            .select()

        if (transactionError) {
            console.error('Error creating transaction:', transactionError)
            return { ok: false, error: transactionError.message }
        }

        return {
            ok: true,
            pointsRedeemed: pointsToRedeem,
            discountAmount: validation.discountAmount,
            newBalance,
            data
        }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error' }
    }
}
