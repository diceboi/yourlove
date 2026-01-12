'use client'

import { useState, useEffect } from 'react'
import { getProductReviews } from '@/app/_actions/review'
import StarRating from '@/app/components/UI/StarRating'
import SingleReview from './SingleReview'
import ProductReviewForm from './ProductReviewForm'

export default function ProductReviews({ productId, initialReviews, initialTotal, averageRating, userProfile }) {
    const [reviews, setReviews] = useState(initialReviews || [])
    const [total, setTotal] = useState(initialTotal || 0)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [filterRating, setFilterRating] = useState(null)
    const [showReviewForm, setShowReviewForm] = useState(false)

    const limit = 5

    useEffect(() => {
        loadReviews()
    }, [page, filterRating])

    const loadReviews = async () => {
        setLoading(true)
        try {
            const result = await getProductReviews(productId, {
                limit,
                offset: (page - 1) * limit,
                minRating: filterRating
            })

            if (result.ok) {
                setReviews(result.data)
                setTotal(result.total)
            }
        } catch (error) {
            console.error('Hiba a vélemények betöltésekor:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(total / limit)

    // Rating distribution
    const ratingCounts = [5, 4, 3, 2, 1].map(rating => {
        // Ez egyszerűsített, ideálisan server-ről jönne
        return { rating, count: 0 }
    })

    return (
        <div className="mt-12">
            <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold mb-6">Vásárlói vélemények</h2>

                {/* Összesítő */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Bal oldal: Átlag */}
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                            {averageRating ? averageRating.toFixed(1) : '0.0'}
                        </div>
                        <StarRating rating={averageRating || 0} size="lg" />
                        <p className="text-gray-600 mt-2">
                            {total} értékelés alapján
                        </p>
                    </div>

                    {/* Jobb oldal: Rating eloszlás */}
                    <div className="space-y-2">
                        {ratingCounts.map(({ rating, count }) => (
                            <button
                                key={rating}
                                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                                className={`
                  w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors
                  ${filterRating === rating ? 'bg-pink-50 border border-pink-200' : ''}
                `}
                            >
                                <div className="flex items-center gap-1 w-16">
                                    <span className="font-medium">{rating}</span>
                                    <StarRating rating={rating} size="sm" showHalf={false} className="gap-0" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vélemény írása gomb */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
                    >
                        {showReviewForm ? 'Mégse' : '✍️ Vélemény írása'}
                    </button>
                </div>

                {/* Vélemény form */}
                {showReviewForm && (
                    <div className="mb-8">
                        <ProductReviewForm
                            productId={productId}
                            userProfile={userProfile}
                        />
                    </div>
                )}

                {/* Vélemények listája */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Betöltés...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <p className="text-gray-600">
                                {filterRating
                                    ? `Nincs ${filterRating} csillagos értékelés`
                                    : 'Még nincs vélemény. Légy te az első!'}
                            </p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <SingleReview key={review.id} review={review} />
                        ))
                    )}
                </div>

                {/* Lapozás */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Előző
                        </button>
                        <span className="px-4 py-2 font-medium">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Következő
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
