'use client'

import { useState, useEffect } from 'react'
import { getAllReviews, approveReview, rejectReview, toggleFeatureReview } from '@/app/_actions/review'
import { TbCheck, TbX, TbStar, TbShieldCheck, TbTrash, TbExternalLink } from 'react-icons/tb'
import { toast } from 'react-toastify'
import Link from 'next/link'
import StarRating from '@/app/components/UI/StarRating'
import Label from '../UI/Texts/Label'

// Helper: Generate product URL from canonical path
function getProductUrl(product) {
    // Use canonical_path if available, otherwise fallback to just slug
    if (product.canonical_path) {
        return `/termekek/${product.canonical_path}/${product.seo_slug}`
    }
    return `/termekek/${product.seo_slug}`
}

export default function AdminReviewList() {
    const [reviews, setReviews] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({
        status: 'all',
        minRating: null,
        search: ''
    })

    const limit = 20

    useEffect(() => {
        loadReviews()
    }, [page, filters])

    const loadReviews = async () => {
        setLoading(true)
        try {
            const result = await getAllReviews(filters, {
                limit,
                offset: (page - 1) * limit
            })

            if (result.ok) {
                setReviews(result.data)
                setTotal(result.total)
            } else {
                toast.error('Hiba a vélemények betöltésekor')
            }
        } catch (error) {
            console.error('Hiba:', error)
            toast.error('Váratlan hiba történt')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (reviewId, e) => {
        e.preventDefault()
        e.stopPropagation()

        const result = await approveReview(reviewId)
        if (result.ok) {
            toast.success('Vélemény jóváhagyva')
            loadReviews()
        } else {
            toast.error(result.error || 'Hiba történt')
        }
    }

    const handleReject = async (reviewId, e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('Biztosan törlöd ezt a véleményt?')) return

        const result = await rejectReview(reviewId)
        if (result.ok) {
            toast.success('Vélemény törölve')
            loadReviews()
        } else {
            toast.error(result.error || 'Hiba történt')
        }
    }

    const handleToggleFeatured = async (reviewId, currentState, e) => {
        e.preventDefault()
        e.stopPropagation()

        const result = await toggleFeatureReview(reviewId, !currentState)
        if (result.ok) {
            toast.success(currentState ? 'Kiemelés eltávolítva' : 'Vélemény kiemelve')
            loadReviews()
        } else {
            toast.error(result.error || 'Hiba történt')
        }
    }

    const totalPages = Math.ceil(total / limit)
    const pendingInPage = reviews.filter(r => !r.is_approved).length
    const approvedInPage = reviews.filter(r => r.is_approved).length

    if (loading && reviews.length === 0) {
        return (
            <div className="flex flex-col gap-2 animate-pulse px-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-[var(--border)] rounded-2xl w-full" />
                ))}
            </div>
        )
    }

    return (
        <div className="px-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-yellow-700">
                        {filters.status === 'pending' ? total : pendingInPage}
                    </div>
                    <div className="text-sm text-yellow-600">Moderálásra vár</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-green-700">
                        {filters.status === 'approved' ? total : approvedInPage}
                    </div>
                    <div className="text-sm text-green-600">Jóváhagyott</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-gray-700">{total}</div>
                    <div className="text-sm text-gray-600">
                        {filters.status === 'all' ? 'Összes' : 'A szűrésben'}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-4 mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <Label>Státusz</Label>
                        <select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters({ ...filters, status: e.target.value })
                                setPage(1)
                            }}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)]"
                        >
                            <option value="all">Összes</option>
                            <option value="pending">Moderálásra vár</option>
                            <option value="approved">Jóváhagyott</option>
                        </select>
                    </div>

                    <div>
                        <Label>Min. értékelés</Label>
                        <select
                            value={filters.minRating || ''}
                            onChange={(e) => {
                                setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : null })
                                setPage(1)
                            }}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)]"
                        >
                            <option value="">Összes</option>
                            <option value="5">5 csillag</option>
                            <option value="4">4+ csillag</option>
                            <option value="3">3+ csillag</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <Label>Keresés</Label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => {
                                setFilters({ ...filters, search: e.target.value })
                                setPage(1)
                            }}
                            placeholder="Keresés vélemény szövegben..."
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)]"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="hidden md:block">
                <div className="relative max-w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
                    <table className="min-w-full table-auto text-sm">
                        <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                            <tr>
                                <th className="text-left font-semibold px-3 py-3">Termék</th>
                                <th className="text-left font-semibold px-3 py-3">Értékelés</th>
                                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">Vélemény</th>
                                <th className="text-left font-semibold px-3 py-3">Szerző</th>
                                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">Dátum</th>
                                <th className="text-left font-semibold px-3 py-3">Státusz</th>
                                <th className="text-right font-semibold px-3 py-3 w-[150px] bg-[#f5f5f5]">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-8 text-center text-gray-600">
                                        Nincs megjeleníthető vélemény
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => {
                                    const reviewerName = review.user_profiles
                                        ? `${review.user_profiles.lastname} ${review.user_profiles.firstname}`
                                        : review.reviewer_name || 'Névtelen'

                                    return (
                                        <tr
                                            key={review.id}
                                            className="border-t border-[var(--border)] hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-3 align-middle">
                                                <Link
                                                    href={getProductUrl(review.products)}
                                                    target="_blank"
                                                    className="font-medium text-[var(--pink)] hover:text-[var(--pink-hover)] flex items-center gap-1"
                                                >
                                                    {review.products.fo_cim}
                                                    <TbExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>

                                            <td className="px-3 py-3 align-middle">
                                                <Link href={`/admin/velemenyek/${review.id}`}>
                                                    <StarRating rating={review.rating} size="sm" showHalf={false} className="gap-0" />
                                                </Link>
                                            </td>

                                            <td className="px-3 py-3 align-middle hidden lg:table-cell">
                                                <Link href={`/admin/velemenyek/${review.id}`} className="block max-w-xs">
                                                    {review.title && (
                                                        <p className="font-semibold truncate">{review.title}</p>
                                                    )}
                                                    <p className="text-gray-600 text-xs truncate">{review.review_text}</p>
                                                </Link>
                                            </td>

                                            <td className="px-3 py-3 align-middle">
                                                <Link href={`/admin/velemenyek/${review.id}`} className="block">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm">{reviewerName}</span>
                                                        {review.is_verified_purchase && (
                                                            <TbShieldCheck className="w-4 h-4 text-green-600" title="Ellenőrzött vásárlás" />
                                                        )}
                                                    </div>
                                                </Link>
                                            </td>

                                            <td className="px-3 py-3 align-middle text-gray-600 text-xs hidden xl:table-cell">
                                                <Link href={`/admin/velemenyek/${review.id}`} className="block">
                                                    {new Date(review.created_at).toLocaleDateString('hu-HU')}
                                                </Link>
                                            </td>

                                            <td className="px-3 py-3 align-middle">
                                                <Link href={`/admin/velemenyek/${review.id}`} className="block">
                                                    <div className="flex items-center gap-1">
                                                        {review.is_approved ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Jóváhagyva
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Várakozik
                                                            </span>
                                                        )}
                                                        {review.is_featured && (
                                                            <TbStar className="w-4 h-4 text-[var(--pink)]" title="Kiemelt" />
                                                        )}
                                                    </div>
                                                </Link>
                                            </td>

                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!review.is_approved && (
                                                        <button
                                                            onClick={(e) => handleApprove(review.id, e)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                            title="Jóváhagy"
                                                        >
                                                            <TbCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {review.is_approved && (
                                                        <button
                                                            onClick={(e) => handleToggleFeatured(review.id, review.is_featured, e)}
                                                            className={`p-1.5 rounded-md transition-colors ${review.is_featured
                                                                ? 'text-[var(--pink)] bg-[var(--cream-pink)]'
                                                                : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                            title={review.is_featured ? 'Kiemelés törlése' : 'Kiemelés'}
                                                        >
                                                            <TbStar className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleReject(review.id, e)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Törlés"
                                                    >
                                                        <TbTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {total} véleményből {(page - 1) * limit + 1}-{Math.min(page * limit, total)} megjelenítve
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Előző
                            </button>
                            <span className="px-4 py-2 font-medium">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Következő
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col gap-2">
                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                        Nincs megjeleníthető vélemény
                    </div>
                ) : (
                    reviews.map((review) => {
                        const reviewerName = review.user_profiles
                            ? `${review.user_profiles.lastname} ${review.user_profiles.firstname}`
                            : review.reviewer_name || 'Névtelen'

                        return (
                            <Link
                                key={review.id}
                                href={`/admin/velemenyek/${review.id}`}
                                className="border border-[var(--border)] rounded-2xl p-4 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <p className="font-semibold">{review.products.fo_cim}</p>
                                        <p className="text-sm text-gray-600">{reviewerName}</p>
                                    </div>
                                    <StarRating rating={review.rating} size="sm" showHalf={false} />
                                </div>
                                {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                                <p className="text-sm text-gray-600 line-clamp-2">{review.review_text}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    {review.is_approved ? (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                            Jóváhagyva
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                            Várakozik
                                        </span>
                                    )}
                                    {review.is_featured && (
                                        <TbStar className="w-4 h-4 text-[var(--pink)]" />
                                    )}
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
