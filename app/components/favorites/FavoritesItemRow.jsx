'use client'
import Link from 'next/link'
import Image from 'next/image'
import { TbShoppingCart, TbTrash } from 'react-icons/tb'
import { addToCart as addToCartAction } from '@/app/_actions/cart'
import { toggleFavorite } from '@/app/_actions/favorites'
import { useRouter } from 'next/navigation'

export default function FavoritesItemRow({ item }) {
    const router = useRouter()

    async function handleAddToCart() {
        const res = await addToCartAction(item.id, 1)
        if (res?.ok) {
            window.dispatchEvent(new Event('cart:changed'))
            window.dispatchEvent(new Event('cart:open'))
            // Close favorites drawer
            window.dispatchEvent(new CustomEvent('favorites:close'))
        } else {
            alert(res?.message || "Nem sikerült kosárba tenni a terméket.")
        }
    }

    async function handleRemove() {
        const res = await toggleFavorite(item.id)
        if (res?.ok) {
            window.dispatchEvent(new Event('favorites:changed'))
            router.refresh()
        } else {
            console.error(res?.message)
        }
    }

    function formatHuf(v) {
        return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(v);
    }

    const productUrl = `/termekek/${item.canonical_path || ''}/${item.seo_slug || item.id}`

    return (
        <div className="flex items-center gap-3">
            {item.image && (
                <Link href={productUrl} className="relative w-16 h-16 shrink-0">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain rounded"
                    />
                </Link>
            )}
            <div className="flex-1 min-w-0">
                <Link href={productUrl} className="text-sm font-medium hover:underline line-clamp-2">
                    {item.name}
                </Link>
                <div className="text-sm text-gray-700 font-semibold mt-1">
                    {formatHuf(item.price)}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-1 rounded-lg bg-[var(--pink)] text-white px-2 py-2 text-sm hover:bg-[var(--pink-hover)] transition-colors"
                    title="Kosárba"
                >
                    <TbShoppingCart className="w-5 h-5" />
                </button>
                <button
                    onClick={handleRemove}
                    className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-gray-700 px-2 py-2 text-sm hover:bg-gray-100 transition-colors"
                    title="Eltávolítás"
                >
                    <TbTrash className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
