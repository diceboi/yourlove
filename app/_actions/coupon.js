'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Összes kupon lekérése admin felülethez
 */
export async function getCoupons() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { ok: false, message: error.message }
    return { ok: true, data }
}

/**
 * Egy kupon lekérése ID alapján
 */
export async function getCouponById(id) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return { ok: false, message: error.message }
    return { ok: true, data }
}

/**
 * Kupon lekérése kód alapján (checkout validáláshoz)
 */
export async function getCouponByCode(code) {
    const supabase = await createClient()

    const upperCode = code.trim().toUpperCase()

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .single()

    if (error) return { ok: false, message: 'Érvénytelen kuponkód' }
    return { ok: true, data }
}

/**
 * Új kupon létrehozása
 */
export async function createCoupon(formData) {
    const supabase = await createClient()

    // Validáció
    if (!formData.code?.trim()) {
        return { ok: false, message: 'A kuponkód megadása kötelező' }
    }

    if (!formData.type) {
        return { ok: false, message: 'A kupon típus megadása kötelező' }
    }

    // Érték validáció (ha nem ingyenes szállítás)
    if (formData.type !== 'free_shipping' && !formData.value) {
        return { ok: false, message: 'Az érték megadása kötelező' }
    }

    const couponData = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: formData.type === 'free_shipping' ? null : parseFloat(formData.value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active ?? true,
    }

    const { data, error } = await supabase
        .from('coupons')
        .insert(couponData)
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { ok: false, message: 'Ez a kuponkód már létezik' }
        }
        return { ok: false, message: error.message }
    }

    return { ok: true, data }
}

/**
 * Kupon frissítése
 */
export async function updateCoupon(id, formData) {
    const supabase = await createClient()

    // Validáció
    if (!formData.code?.trim()) {
        return { ok: false, message: 'A kuponkód megadása kötelező' }
    }

    if (!formData.type) {
        return { ok: false, message: 'A kupon típus megadása kötelező' }
    }

    if (formData.type !== 'free_shipping' && !formData.value) {
        return { ok: false, message: 'Az érték megadása kötelező' }
    }

    const couponData = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: formData.type === 'free_shipping' ? null : parseFloat(formData.value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { ok: false, message: 'Ez a kuponkód már létezik' }
        }
        return { ok: false, message: error.message }
    }

    return { ok: true, data }
}

/**
 * Kupon törlése
 */
export async function deleteCoupon(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

    if (error) return { ok: false, message: error.message }
    return { ok: true }
}

/**
 * Kupon validálása és kedvezmény kalkuláció
 */
export async function validateCoupon(code, orderTotal, shippingCost = 0) {
    const supabase = await createClient()

    const upperCode = code.trim().toUpperCase()

    // Kupon lekérése
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .single()

    if (error) {
        return { ok: false, message: 'Érvénytelen kuponkód' }
    }

    // Aktív állapot ellenőrzés
    if (!coupon.is_active) {
        return { ok: false, message: 'Ez a kupon nem aktív' }
    }

    // Érvényesség ellenőrzés
    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return { ok: false, message: 'Ez a kupon még nem érvényes' }
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return { ok: false, message: 'Ez a kupon lejárt' }
    }

    // Minimum rendelési érték ellenőrzés
    if (coupon.min_order_value && orderTotal < coupon.min_order_value) {
        return {
            ok: false,
            message: `A minimum rendelési érték ${coupon.min_order_value.toLocaleString('hu-HU')} Ft`
        }
    }

    // Maximum felhasználás ellenőrzés
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        return { ok: false, message: 'Ez a kupon elérte a felhasználási limitet' }
    }

    // Kedvezmény kalkuláció
    let discountAmount = 0
    let shippingDiscount = 0

    switch (coupon.type) {
        case 'percentage':
            discountAmount = Math.round(orderTotal * (coupon.value / 100))
            break
        case 'fixed':
            discountAmount = Math.min(coupon.value, orderTotal)
            break
        case 'free_shipping':
            shippingDiscount = shippingCost
            break
    }

    return {
        ok: true,
        coupon,
        discountAmount,
        shippingDiscount,
        totalDiscount: discountAmount + shippingDiscount
    }
}

/**
 * Kupon használat naplózása (rendelés leadáskor)
 */
export async function logCouponUse(couponId, orderId, userId, discountAmount) {
    const supabase = await createClient()

    // Használat naplózása
    await supabase.from('coupon_uses').insert({
        coupon_id: couponId,
        order_id: orderId,
        user_id: userId,
        discount_amount: discountAmount,
    })

    // Számláló növelése
    await supabase.rpc('increment_coupon_uses', { coupon_id: couponId })

    return { ok: true }
}
