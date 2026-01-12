'use client'

import { useState } from 'react'
import StarRating from '@/app/components/UI/StarRating'
import { submitReview } from '@/app/_actions/review'
import { toast } from 'react-toastify'

export default function ProductReviewForm({ productId, userProfile }) {
    const [formData, setFormData] = useState({
        rating: 0,
        title: '',
        reviewText: '',
        reviewerName: userProfile ? '' : '',
        reviewerEmail: userProfile ? '' : ''
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.rating === 0) {
            toast.error('Kérlek válassz csillag értékelést!')
            return
        }

        if (formData.reviewText.trim().length < 10) {
            toast.error('A vélemény legalább 10 karakter hosszú legyen!')
            return
        }

        if (!userProfile && !formData.reviewerName.trim()) {
            toast.error('Kérlek add meg a neved!')
            return
        }

        setSubmitting(true)

        try {
            const result = await submitReview({
                productId,
                rating: formData.rating,
                title: formData.title.trim() || null,
                reviewText: formData.reviewText.trim(),
                reviewerName: formData.reviewerName.trim() || null,
                reviewerEmail: formData.reviewerEmail.trim() || null
            })

            if (result.ok) {
                toast.success('Köszönjük a véleményed! Moderálás után megjelenik.')
                setFormData({
                    rating: 0,
                    title: '',
                    reviewText: '',
                    reviewerName: '',
                    reviewerEmail: ''
                })
            } else {
                toast.error(result.error || 'Hiba történt a vélemény küldésekor')
            }
        } catch (error) {
            toast.error('Váratlan hiba történt')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Írd meg a véleményedet</h3>

            {/* Csillag értékelés */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Értékelés *
                </label>
                <StarRating
                    rating={formData.rating}
                    interactive={true}
                    onChange={(rating) => setFormData({ ...formData, rating })}
                    size="lg"
                    showHalf={false}
                />
            </div>

            {/* Címsor */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Címsor (opcionális)
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent"
                    placeholder="pl. Nagyon elégedett vagyok!"
                />
            </div>

            {/* Vélemény szöveg */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vélemény *
                </label>
                <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    rows={5}
                    required
                    minLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ossz meg tapasztalataidat a termékkel kapcsolatban..."
                />
                <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 karakter
                </p>
            </div>

            {/* Név és email (ha nincs bejelentkezve) */}
            {!userProfile && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Neved *
                        </label>
                        <input
                            type="text"
                            value={formData.reviewerName}
                            onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="pl. Kiss Anna"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email (opcionális)
                        </label>
                        <input
                            type="email"
                            value={formData.reviewerEmail}
                            onChange={(e) => setFormData({ ...formData, reviewerEmail: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="email@example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Nem lesz nyilvános
                        </p>
                    </div>
                </>
            )}

            {/* Submit gomb */}
            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--pink)] text-white py-3 rounded-full font-semibold hover:bg-[var(--pink-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {submitting ? 'Küldés...' : 'Vélemény küldése'}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
                Véleményed moderálás után jelenik meg a termék oldalon.
            </p>
        </form>
    )
}
