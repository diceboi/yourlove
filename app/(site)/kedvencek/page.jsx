export const dynamic = 'force-dynamic'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import H2 from '@/app/components/UI/Texts/H2'
import ProductListItem from '@/app/components/UI/ProductListItem'

function toInt(v) {
    if (v == null) return null
    const s = String(v).replace(/\s+/g, '').replace(',', '.')
    const n = Number.parseFloat(s)
    if (!Number.isFinite(n)) return null
    return Math.round(n)
}

function computeUnitPrice(p) {
    const base = toInt(p.eladasi_ar_brutto)
    const promoFixed = toInt(p.akcios_ar_brutto)
    const discountPercent = toInt(p.akcio_szazalek)
    const discountFixed = toInt(p.akcio_ar)

    if (promoFixed && promoFixed > 0) return promoFixed
    if (base && discountPercent && discountPercent > 0) {
        return Math.max(0, Math.round(base * (100 - discountPercent) / 100))
    }
    if (base && discountFixed && discountFixed > 0) {
        return Math.max(0, base - discountFixed)
    }
    return base ?? null
}

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
        .from('favorites')
        .select(`
      product_id,
      created_at,
      products:product_id (
        id,
        fo_cim,
        alcim,
        eladasi_ar_brutto,
        akcios_ar_brutto,
        akcio_szazalek,
        akcio_ar,
        seo_slug,
        canonical_path,
        main_image_url,
        stock,
        color_options
      )
    `)
        .order('created_at', { ascending: false })

    if (user) {
        query = query.eq('user_id', user.id)
    } else {
        const jar = await cookies()
        const token = jar.get('favorites_token')?.value
        if (!token) {
            return (
                <div className="container-inner mx-auto py-12 px-4">
                    <H2 className="text-2xl font-semibold mb-8">Kedvencek</H2>
                    <div className="text-center text-gray-500">
                        <p>Még nincsenek kedvenceid.</p>
                    </div>
                </div>
            )
        }
        query = query.eq('session_token', token)
    }

    const { data, error } = await query

    if (error || !data?.length) {
        return (
            <div className="container-inner mx-auto py-12 px-4">
                <H2 className="text-2xl font-semibold mb-8">Kedvencek</H2>
                <div className="text-center text-gray-500">
                    <p>Még nincsenek kedvenceid.</p>
                </div>
            </div>
        )
    }

    const products = data.map(row => {
        const p = row.products || {}
        return {
            id: p.id || row.product_id,
            image: p.main_image_url,
            focim: p.fo_cim,
            alcim: p.alcim,
            price: computeUnitPrice(p) ?? 0,
            slug: p.seo_slug,
            canonical_path: p.canonical_path,
            stock: p.stock,
            colors: p.color_options
        }
    })

    return (
        <div className="container-inner mx-auto py-12 px-4">
            <H2 className="text-2xl font-semibold mb-8">Kedvencek</H2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                    <ProductListItem
                        key={p.id}
                        id={p.id}
                        image={p.image}
                        focim={p.focim}
                        alcim={p.alcim}
                        price={p.price}
                        slug={p.slug}
                        canonical_path={p.canonical_path}
                        stock={p.stock}
                        colors={p.colors}
                    />
                ))}
            </div>
        </div>
    )
}
