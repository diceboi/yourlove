'use client'

import { useState, useEffect } from 'react'
import { getCoupons, deleteCoupon } from '@/app/_actions/coupon'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { TbEdit, TbTrash, TbPlus, TbTicket } from 'react-icons/tb'

export default function AdminCouponList() {
    const router = useRouter()
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCoupons()
    }, [])

    async function loadCoupons() {
        setLoading(true)
        const result = await getCoupons()
        if (result.ok) {
            setCoupons(result.data)
        } else {
            toast.error('Hiba a kuponok betöltésekor')
        }
        setLoading(false)
    }

    async function handleDelete(id, code) {
        if (!confirm(`Biztosan törölni szeretnéd a "${code}" kupont?`)) return

        const result = await deleteCoupon(id)
        if (result.ok) {
            toast.success('Kupon törölve')
            loadCoupons()
        } else {
            toast.error(result.message || 'Hiba történt')
        }
    }

    function getCouponTypeLabel(type) {
        switch (type) {
            case 'percentage': return 'Százalékos'
            case 'fixed': return 'Fix összeg'
            case 'free_shipping': return 'Ingyenes szállítás'
            default: return type
        }
    }

    function getCouponValue(coupon) {
        if (coupon.type === 'free_shipping') return '-'
        if (coupon.type === 'percentage') return `${coupon.value}%`
        return `${coupon.value?.toLocaleString('hu-HU')} Ft`
    }

    function formatDate(dateString) {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('hu-HU')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Betöltés...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center px-6">
                <h1 className="text-2xl font-bold text-gray-900">Kuponok</h1>
                <button
                    onClick={() => router.push('/admin/kuponok/uj')}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--green)] text-white rounded-xl hover:opacity-90 transition-opacity font-semibold"
                >
                    <TbPlus className="w-5 h-5" />
                    Új kupon
                </button>
            </div>

            {/* Kuponok táblázat */}
            {coupons.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--border)] p-8 text-center mx-6">
                    <TbTicket className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Még nincsenek kuponok</p>
                    <button
                        onClick={() => router.push('/admin/kuponok/uj')}
                        className="mt-4 text-[var(--green)] hover:underline font-semibold"
                    >
                        Hozz létre egyet most
                    </button>
                </div>
            ) : (
                <div className="px-6">
                    <div className="relative max-w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
                        <table className="min-w-full table-auto text-sm">
                            <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                                <tr>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Kód
                                    </th>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Típus
                                    </th>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Érték
                                    </th>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Min. érték
                                    </th>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Érvényesség
                                    </th>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Használat
                                    </th>
                                    <th className="text-left font-semibold px-3 py-3">
                                        Státusz
                                    </th>
                                    <th className="text-right font-semibold px-3 py-3 w-[120px] bg-white sticky right-0 z-10">
                                        Műveletek
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">{coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-t border-[var(--border)] hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-3 py-3 align-middle">
                                        <span className="font-mono font-semibold text-gray-900">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 align-middle text-sm text-gray-600">
                                        {getCouponTypeLabel(coupon.type)}
                                    </td>
                                    <td className="px-3 py-3 align-middle text-sm font-medium text-gray-900">
                                        {getCouponValue(coupon)}
                                    </td>
                                    <td className="px-3 py-3 align-middle text-sm text-gray-600">
                                        {coupon.min_order_value > 0
                                            ? `${coupon.min_order_value?.toLocaleString('hu-HU')} Ft`
                                            : '—'}
                                    </td>
                                    <td className="px-3 py-3 align-middle text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <span>{formatDate(coupon.valid_from)}</span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(coupon.valid_until)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-middle text-sm">
                                        <span className={`${coupon.max_uses && coupon.uses_count >= coupon.max_uses
                                            ? 'text-red-600 font-semibold'
                                            : 'text-gray-600'
                                            }`}>
                                            {coupon.uses_count || 0}
                                            {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 align-middle">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${coupon.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {coupon.is_active ? 'Aktív' : 'Inaktív'}
                                        </span>
                                    </td>
                                    <td className="pl-3 align-middle w-[120px] min-w-[120px] sticky right-0 z-20 bg-white">
                                        <div className="flex items-center justify-end gap-0 h-[72px]">
                                            <Link
                                                href={`/admin/kuponok/${coupon.id}`}
                                                aria-label="Szerkesztés"
                                                className="flex items-center justify-center hover:bg-gray-50 w-full h-full relative z-30"
                                            >
                                                <TbEdit className="w-5 h-auto" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
