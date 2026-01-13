'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get all users with pagination and filters
 */
export async function getAllUsers(filters = {}, pagination = {}) {
    const {
        role = null,
        search = null
    } = filters

    const {
        limit = 20,
        offset = 0
    } = pagination

    const sb = await createClient()

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

    // Build query
    let query = sb
        .from('user_profiles')
        .select('*', { count: 'exact' })

    if (role) {
        query = query.eq('role', role)
    }

    if (search) {
        query = query.or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching users:', error)
        return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [], total: count || 0 }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
    const sb = await createClient()

    // Check permissions
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

    const { data, error } = await sb
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user:', error)
        return { ok: false, error: error.message }
    }

    return { ok: true, data }
}

/**
 * Update user role
 */
export async function updateUserRole(userId, newRole) {
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

        // Validate role
        if (!['user', 'admin', 'superadmin'].includes(newRole)) {
            return { ok: false, error: 'Invalid role' }
        }

        // Get target user
        const { data: targetUser } = await sb
            .from('user_profiles')
            .select('role, email')
            .eq('id', userId)
            .single()

        if (!targetUser) {
            return { ok: false, error: 'User not found' }
        }

        // Protect superadmin role - only superadmin can change superadmin roles
        if (targetUser.role === 'superadmin' && currentUserProfile.role !== 'superadmin') {
            return { ok: false, error: 'Cannot modify superadmin role' }
        }

        // Prevent changing own role
        if (userId === user.id) {
            return { ok: false, error: 'Cannot change your own role' }
        }

        // Update role
        const { data, error } = await sb
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select()

        if (error) {
            console.error('Error updating user role:', error)
            return { ok: false, error: error.message }
        }

        if (!data || data.length === 0) {
            return { ok: false, error: 'User not found or update failed' }
        }

        revalidatePath('/admin/felhasznalok')
        return { ok: true, data: data[0] }

    } catch (err) {
        console.error('Unexpected error:', err)
        return { ok: false, error: 'Unexpected error occurred' }
    }
}
