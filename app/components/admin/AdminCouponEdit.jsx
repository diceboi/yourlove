'use client'

import { useState, useEffect } from 'react'
import { getCouponById, updateCoupon } from '@/app/_actions/coupon'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import AdminSaveButton from '@/app/components/UI/Buttons/AdminSaveButton'
import AdminCancelButton from '@/app/components/UI/Buttons/AdminCancelButton'
import { TbChevronLeft } from 'react-icons/tb'
import Paragraph from '@/app/components/UI/Texts/Paragraph'

export default function AdminCouponEdit({ couponId }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        min_order_value: '0',
        max_uses: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
    })

    const handleClose = () => {
        router.back()
    }

    useEffect(() => {
        if (couponId) {
            loadCoupon()
        }
    }, [couponId])

    async function loadCoupon() {
        if (!couponId) return

        setFetching(true)
        const result = await getCouponById(couponId)

        if (result.ok) {
            const coupon = result.data
            setFormData({
                code: coupon.code || '',
                type: coupon.type || 'percentage',
                value: coupon.value?.toString() || '',
                min_order_value: coupon.min_order_value?.toString() || '0',
                max_uses: coupon.max_uses?.toString() || '',
                valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : '',
                valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : '',
                is_active: coupon.is_active ?? true,
            })
        } else {
            toast.error('Hiba a kupon betöltésekor')
        }

        setFetching(false)
    }

    function handleChange(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        const result = await updateCoupon(couponId, formData)

        if (result.ok) {
            toast.success('Kupon sikeresen frissítve')
            router.push('/admin/kuponok')
            router.refresh()
        } else {
            toast.error(result.message || 'Hiba történt')
        }

        setLoading(false)
    }

    if (fetching) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Betöltés...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-1 border-b border-[var(--border)]">
                <div className="flex flex-col md:flex-row justify-between md:items-center items-start w-full gap-2">
                    <div className="flex flex-nowrap gap-2">
                        <button
                            type="button"
                            className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
                            onClick={handleClose}
                        >
                            <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
                        </button>
                        <div className="flex lg:flex-row flex-col gap-1 items-center">
                            <h1 className="text-xl font-bold w-full p-2">
                                {formData.code || 'Kupon szerkesztése'}
                            </h1>
                            <Paragraph classname={"min-w-fit"}>
                                ID: {couponId || ''}
                            </Paragraph>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:p-6 p-3">
                {/* Kupon kód */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kupon kód* <span className="text-xs text-gray-500">(Automatikusan nagybetűs)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-[var(--pink)] font-mono"
                        placeholder="pl. WELCOME10"
                        required
                    />
                </div>

                {/* Típus */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kupon típus*
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="type"
                                value="percentage"
                                checked={formData.type === 'percentage'}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="accent-[var(--pink)]"
                            />
                            <div>
                                <div className="font-medium">Százalékos kedvezmény</div>
                                <div className="text-xs text-gray-500">pl. 10% az egész kosárra</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-2 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="type"
                                value="fixed"
                                checked={formData.type === 'fixed'}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="accent-[var(--pink)]"
                            />
                            <div>
                                <div className="font-medium">Fix összeg levonás</div>
                                <div className="text-xs text-gray-500">pl. 1000 Ft kedvezmény</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-2 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="type"
                                value="free_shipping"
                                checked={formData.type === 'free_shipping'}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="accent-[var(--pink)]"
                            />
                            <div>
                                <div className="font-medium">Ingyenes szállítás</div>
                                <div className="text-xs text-gray-500">A szállítási költség 0 Ft lesz</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Érték (ha nem ingyenes szállítás) */}
                {formData.type !== 'free_shipping' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {formData.type === 'percentage' ? 'Százalék (%)' : 'Összeg (Ft)'}*
                        </label>
                        <input
                            type="number"
                            value={formData.value}
                            onChange={(e) => handleChange('value', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-[var(--pink)]"
                            placeholder={formData.type === 'percentage' ? 'pl. 10' : 'pl. 1000'}
                            min="0"
                            step={formData.type === 'percentage' ? '0.01' : '1'}
                            required
                        />
                    </div>
                )}

                {/* Min. rendelési érték */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum rendelési érték (Ft)
                    </label>
                    <input
                        type="number"
                        value={formData.min_order_value}
                        onChange={(e) => handleChange('min_order_value', e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-[var(--pink)]"
                        placeholder="0 = nincs minimum"
                        min="0"
                        step="1"
                    />
                </div>

                {/* Max. felhasználás */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximális felhasználás (db)
                    </label>
                    <input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => handleChange('max_uses', e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-[var(--pink)]"
                        placeholder="Üres = korlátlan"
                        min="1"
                        step="1"
                    />
                </div>

                {/* Érvényesség */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Érvényes ettől
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.valid_from}
                            onChange={(e) => handleChange('valid_from', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-[var(--pink)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Érvényes eddig
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.valid_until}
                            onChange={(e) => handleChange('valid_until', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-[var(--pink)]"
                        />
                    </div>
                </div>

                {/* Aktív státusz */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="w-4 h-4 accent-[var(--pink)]"
                        />
                        <span className="text-sm font-medium text-gray-700">Kupon aktív</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                        Csak az aktív kuponok használhatók a checkout során
                    </p>
                </div>
            </form>

            {/* Fixed footer gombok - ugyanúgy mint a termékeknél */}
            <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-end items-center gap-2 w-full">
                <div className="flex flex-row gap-2">
                    <AdminCancelButton
                        title={"Vissza"}
                        link={""}
                        onclick={handleClose}
                        buttonicon={"TbX"}
                    />
                    <AdminSaveButton
                        title={loading ? "Mentés..." : "Mentés"}
                        link={""}
                        onclick={handleSubmit}
                        buttonicon={"TbDeviceFloppy"}
                    />
                </div>
            </div>
        </div>
    )
}
