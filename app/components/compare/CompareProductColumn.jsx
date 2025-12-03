'use client'
import Image from 'next/image'
import Link from 'next/link'
import { TbX, TbShoppingCart } from 'react-icons/tb'
import { useCompareUI } from './CompareUIProvider'
import { addToCart as addToCartAction } from '@/app/_actions/cart'

export default function CompareProductColumn({ product }) {
    const { removeProduct } = useCompareUI()

    async function handleAddToCart() {
        const res = await addToCartAction(product.id, 1)
        if (res?.ok) {
            window.dispatchEvent(new Event('cart:changed'))
            window.dispatchEvent(new Event('cart:open'))
            window.dispatchEvent(new Event('compare:close'))
        } else {
            alert(res?.message || "Nem sikerült kosárba tenni a terméket.")
        }
    }

    function formatHuf(v) {
        if (!v) return 'N/A'
        return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(v)
    }

    const productUrl = `/termekek/${product.canonical_path || ''}/${product.seo_slug || product.id}`

    // Define spec groups
    const specs = [
        {
            label: 'Alapadatok', items: [
                { label: 'Cikkszám', value: product.cikkszam },
                { label: 'Márka', value: product.gyarto },
                { label: 'Garancia', value: product.garancia ? `${product.garancia} hónap` : null },
                { label: 'Készlet', value: product.keszlet },
            ]
        },
        {
            label: 'Méretek', items: [
                { label: 'Méretek', value: product.meretek },
                { label: 'Hossz', value: product.hossz },
                { label: 'Szélesség', value: product.szelesseg },
                { label: 'Magasság', value: product.magassag },
                { label: 'Összes hossz', value: product.osszes_hossz },
                { label: 'Használható hossz', value: product.hasznalhato_hossz },
                { label: 'Belső átmérő', value: product.belso_atmero },
                { label: 'Külső átmérő', value: product.kulso_atmero },
                { label: 'Súly', value: product.suly },
            ]
        },
        {
            label: 'Anyagok', items: [
                { label: 'Anyag', value: product.anyag },
                { label: 'Külső anyag', value: product.kulso_anyag },
                { label: 'Belső anyag', value: product.belso_anyag },
                { label: 'Szín', value: product.szin },
            ]
        },
        {
            label: 'Műszaki adatok', items: [
                { label: 'Töltés', value: product.toltes },
                { label: 'Töltési idő', value: product.toltesi_ido },
                { label: 'Zajszint', value: product.zajszint },
                { label: 'Vízállóság', value: product.vizallosag },
                { label: 'Használati idő', value: product.hasznalati_ido },
                { label: 'Vibrációs módok', value: product.vibracios_modok },
                { label: 'Sebességfokozatok', value: product.sebessegfokozatok },
                { label: 'Vezérlés', value: product.vezerles },
                { label: 'Applikáció', value: product.applikacio },
                { label: 'Fűtés funkció', value: product.futes_funkcio },
            ]
        },
    ]

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Product Header */}
            <div className="relative bg-gray-50 p-4">
                <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-10"
                    title="Eltávolítás"
                >
                    <TbX className="w-5 h-5" />
                </button>

                {product.termekkep && (
                    <Link href={productUrl} className="block relative w-full h-32 mb-3">
                        <Image
                            src={product.termekkep}
                            alt={product.fo_cim || 'Termék'}
                            fill
                            className="object-contain"
                        />
                    </Link>
                )}

                <Link href={productUrl} className="block">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">{product.fo_cim}</h4>
                    {product.alcim && <p className="text-xs text-gray-600 line-clamp-1">{product.alcim}</p>}
                </Link>

                <div className="mt-3">
                    <div className="text-lg font-bold text-[var(--pink)]">
                        {formatHuf(product.eladasi_ar_brutto)}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--pink)] text-white px-3 py-2 text-sm hover:bg-[var(--pink-hover)] transition-colors"
                    >
                        <TbShoppingCart />
                        Kosárba
                    </button>
                </div>
            </div>

            {/* Specifications */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {specs.map((group, idx) => {
                    const visibleItems = group.items.filter(item => item.value)
                    if (!visibleItems.length) return null

                    return (
                        <div key={idx}>
                            <h5 className="font-semibold text-sm mb-2 text-gray-700 border-b pb-1">{group.label}</h5>
                            <div className="space-y-2">
                                {visibleItems.map((item, i) => (
                                    <div key={i} className="text-xs">
                                        <div className="text-gray-600">{item.label}</div>
                                        <div className="font-medium">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
