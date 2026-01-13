'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TbArrowDown, TbCoins } from "react-icons/tb"
import { validatePointsRedemption } from '@/app/_actions/loyalty-points'

export default function SummaryClient({ items, total, itemCount, currentPoints = 0, pointsToEarn = 0 }) {
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [usePoints, setUsePoints] = useState(false)
    const [pointsToRedeem, setPointsToRedeem] = useState(0)
    const [pointsDiscount, setPointsDiscount] = useState(0)
    const [pointsError, setPointsError] = useState('')

    useEffect(() => {
        // Listen for coupon changes from CheckoutForm
        const handleCouponUpdate = (e) => {
            setAppliedCoupon(e.detail)
        }

        window.addEventListener('couponApplied', handleCouponUpdate)
        window.addEventListener('couponRemoved', () => setAppliedCoupon(null))

        // Check localStorage for existing coupon
        const storedCoupon = localStorage.getItem('appliedCoupon')
        if (storedCoupon) {
            try {
                setAppliedCoupon(JSON.parse(storedCoupon))
            } catch (e) {
                console.error('Error parsing stored coupon:', e)
            }
        }

        return () => {
            window.removeEventListener('couponApplied', handleCouponUpdate)
            window.removeEventListener('couponRemoved', () => setAppliedCoupon(null))
        }
    }, [])

    // Handle points redemption
    useEffect(() => {
        if (usePoints && pointsToRedeem > 0) {
            // Dispatch event so CheckoutForm knows about points redemption
            window.dispatchEvent(new CustomEvent('pointsRedemption', {
                detail: {
                    pointsToRedeem,
                    discountAmount: pointsDiscount
                }
            }))
        } else {
            window.dispatchEvent(new CustomEvent('pointsRedemptionRemoved'))
        }
    }, [usePoints, pointsToRedeem, pointsDiscount])

    const handlePointsToggle = () => {
        if (!usePoints) {
            // When enabling, default to all available points
            setPointsToRedeem(currentPoints)
            validatePoints(currentPoints)
        } else {
            // When disabling, reset
            setPointsToRedeem(0)
            setPointsDiscount(0)
            setPointsError('')
        }
        setUsePoints(!usePoints)
    }

    const validatePoints = async (points) => {
        if (!points || points <= 0) {
            setPointsDiscount(0)
            setPointsError('')
            return
        }

        // Get current user ID from auth
        const response = await fetch('/api/auth/user')
        const { user } = await response.json()

        if (!user) {
            setPointsError('Be kell jelentkezned')
            return
        }

        const result = await validatePointsRedemption(user.id, points)

        if (result.ok) {
            setPointsDiscount(result.discountAmount)
            setPointsError('')
        } else {
            setPointsDiscount(0)
            setPointsError(result.error)
        }
    }

    const handlePointsChange = (value) => {
        const points = parseInt(value) || 0
        setPointsToRedeem(points)
        validatePoints(points)
    }

    const couponDiscount = appliedCoupon?.discountAmount || 0
    const totalDiscount = couponDiscount + pointsDiscount
    const finalTotal = Math.max(0, total - totalDiscount)

    return (
        <div className="rounded-2xl lg:w-1/3 w-full bg-[var(--grey-bg)] lg:p-3 p-0">
            <h2 className="text-lg font-semibold mb-3 hidden lg:block text-[var(--pink)]">
                Rendelés összegzés
            </h2>

            {/* Mobilon: <details> / <summary> — nincs JS, SSR barát */}
            <details
                className="lg:hidden border border-[var(--border)] rounded-2xl overflow-hidden"
                open
            >
                <summary className="flex justify-between items-center px-4 py-3 bg-gray-50 cursor-pointer list-none">
                    <div className="flex flex-col text-left">
                        <span className="font-medium text-[15px] text-[var(--pink)]">Rendelés összegzés</span>
                        <span className="text-xs text-gray-600">
                            {itemCount} termék – <strong>{finalTotal.toLocaleString('hu-HU')} Ft</strong>
                        </span>
                    </div>
                    <TbArrowDown />
                </summary>

                <div className="p-4 border-t border-[var(--border)] bg-white">
                    {items?.length ? (
                        <>
                            <ul className="">
                                {items.map((it) => {
                                    const name =
                                        [it?.product?.fo_cim, it?.product?.alcim]
                                            .filter(Boolean)
                                            .join(' ') || 'Termék'
                                    const img = it?.product?.termekkep || null
                                    return (
                                        <li key={it.id} className="py-3 flex gap-3 border-b border-white">
                                            {img ? (
                                                <Image
                                                    src={img}
                                                    alt={name}
                                                    width={56}
                                                    height={56}
                                                    className="rounded object-cover"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500">
                                                    Nincs kép
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{name}</div>
                                                <div className="text-xs text-gray-600">
                                                    Mennyiség: {it.qty}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {(it.unit_price_huf * it.qty).toLocaleString('hu-HU')} Ft
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">Végösszeg</div>
                                    <div className="text-lg font-semibold">
                                        {total.toLocaleString('hu-HU')} Ft
                                    </div>
                                </div>

                                {/* Alkalmazott kupon */}
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-green-700 font-medium pt-2 border-t border-gray-200 mt-2">
                                        <span>Kupon ({appliedCoupon.code})</span>
                                        <span>-{couponDiscount.toLocaleString('hu-HU')} Ft</span>
                                    </div>
                                )}

                                {/* Points Redemption */}
                                {currentPoints > 0 && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-[var(--pink)]/10 to-purple-100 rounded-lg border border-[var(--pink)]/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <TbCoins className="w-5 h-5 text-[var(--pink)]" />
                                                <span className="text-sm font-semibold text-gray-900">Pontok felhasználása</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={usePoints}
                                                    onChange={handlePointsToggle}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--pink)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--pink)]"></div>
                                            </label>
                                        </div>

                                        {usePoints && (
                                            <div className="space-y-2">
                                                <div className="text-xs text-gray-600">
                                                    Elérhető: <strong>{currentPoints.toLocaleString('hu-HU')} pont</strong>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={currentPoints}
                                                    value={pointsToRedeem}
                                                    onChange={(e) => handlePointsChange(e.target.value)}
                                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent"
                                                    placeholder="Beváltandó pontok"
                                                />
                                                {pointsError && (
                                                    <div className="text-xs text-red-600">{pointsError}</div>
                                                )}
                                                {pointsDiscount > 0 && (
                                                    <div className="flex justify-between text-sm font-medium text-[var(--pink)]">
                                                        <span>Kedvezmény:</span>
                                                        <span>-{pointsDiscount.toLocaleString('hu-HU')} Ft</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Points to Earn */}
                                {pointsToEarn > 0 && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 text-sm text-blue-800">
                                            <TbCoins className="w-4 h-4" />
                                            <span>Ebből a vásárlásból kapsz: <strong>+{pointsToEarn} pont</strong></span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                                    <span>Fizetendő</span>
                                    <span>{finalTotal.toLocaleString('hu-HU')} Ft</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-gray-600">A kosarad üres.</div>
                    )}
                </div>
            </details>

            {/* Desktopon mindig nyitva marad */}
            <div className="hidden lg:block bg-[--border]">
                {!items?.length ? (
                    <div className="text-sm text-gray-600">A kosarad üres.</div>
                ) : (
                    <>
                        <ul className="">
                            {items.map((it) => {
                                const name =
                                    [it?.product?.fo_cim, it?.product?.alcim]
                                        .filter(Boolean)
                                        .join(' ') || 'Termék'
                                const img = it?.product?.termekkep || null
                                return (
                                    <li key={it.id} className="py-3 flex gap-3 border-b border-white">
                                        {img ? (
                                            <Image
                                                src={img}
                                                alt={name}
                                                width={56}
                                                height={56}
                                                className="rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500">
                                                Nincs kép
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{name}</div>
                                            <div className="text-xs text-gray-600">
                                                Mennyiség: {it.qty}
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {(it.unit_price_huf * it.qty).toLocaleString('hu-HU')} Ft
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">Végösszeg</div>
                                <div className="text-lg font-semibold">
                                    {total.toLocaleString('hu-HU')} Ft
                                </div>
                            </div>

                            {/* Alkalmazott kupon */}
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-green-700 font-medium pt-2 border-t border-gray-200 mt-2">
                                    <span>Kupon ({appliedCoupon.code})</span>
                                    <span>-{couponDiscount.toLocaleString('hu-HU')} Ft</span>
                                </div>
                            )}

                            {/* Points Redemption */}
                            {currentPoints > 0 && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-[var(--pink)]/10 to-purple-100 rounded-lg border border-[var(--pink)]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <TbCoins className="w-5 h-5 text-[var(--pink)]" />
                                            <span className="text-sm font-semibold text-gray-900">Pontok felhasználása</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={usePoints}
                                                onChange={handlePointsToggle}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--pink)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--pink)]"></div>
                                        </label>
                                    </div>

                                    {usePoints && (
                                        <div className="space-y-2">
                                            <div className="text-xs text-gray-600">
                                                Elérhető: <strong>{currentPoints.toLocaleString('hu-HU')} pont</strong>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max={currentPoints}
                                                value={pointsToRedeem}
                                                onChange={(e) => handlePointsChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent"
                                                placeholder="Beváltandó pontok"
                                            />
                                            {pointsError && (
                                                <div className="text-xs text-red-600">{pointsError}</div>
                                            )}
                                            {pointsDiscount > 0 && (
                                                <div className="flex justify-between text-sm font-medium text-[var(--pink)]">
                                                    <span>Kedvezmény:</span>
                                                    <span>-{pointsDiscount.toLocaleString('hu-HU')} Ft</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Points to Earn */}
                            {pointsToEarn > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <TbCoins className="w-4 h-4" />
                                        <span>Ebből a vásárlásból kapsz: <strong>+{pointsToEarn} pont</strong></span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                                <span>Fizetendő</span>
                                <span>{finalTotal.toLocaleString('hu-HU')} Ft</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
