'use server'

import { createClient } from '@/utils/supabase/server'

export async function getCompareProducts(productIds) {
    if (!productIds || !productIds.length) {
        return { ok: true, products: [] }
    }

    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)

        if (error) throw error

        // Maintain order from productIds
        const ordered = productIds
            .map(id => data?.find(p => p.id === id))
            .filter(Boolean)

        return { ok: true, products: ordered }
    } catch (e) {
        console.error('getCompareProducts error:', e)
        return { ok: false, message: e.message, products: [] }
    }
}
