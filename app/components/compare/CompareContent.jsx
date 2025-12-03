'use client'
import { useState, useEffect } from 'react'
import { getCompareProducts } from '@/app/_actions/compare'
import { useCompareUI } from './CompareUIProvider'
import CompareProductColumn from './CompareProductColumn'

export default function CompareContent() {
    const { compareIds, clearAll } = useCompareUI()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!compareIds.length) {
            setProducts([])
            setLoading(false)
            return
        }

        setLoading(true)
        getCompareProducts(compareIds).then(res => {
            if (res.ok) {
                setProducts(res.products)
            }
            setLoading(false)
        })
    }, [compareIds])

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Betöltés...</div>
    }

    if (!products.length) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>Még nincs termék az összehasonlításban.</p>
                <p className="text-sm mt-2">Kattints az összehasonlítás gombra a terméklapokon!</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={clearAll}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                    Összes törlése
                </button>
            </div>
            {/* Horizontally scrollable grid on mobile */}
            <div className="overflow-x-auto -mx-4 px-4">
                <div className={`flex lg:grid gap-4 ${products.length === 1 ? 'lg:grid-cols-1' : products.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
                    {products.map(product => (
                        <div key={product.id} className="flex-shrink-0 w-[65vw] lg:w-auto">
                            <CompareProductColumn product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
