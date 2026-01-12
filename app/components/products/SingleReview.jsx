import StarRating from '@/app/components/UI/StarRating'
import { TbShieldCheck } from 'react-icons/tb'

export default function SingleReview({ review }) {
    const reviewerName = review.user_profiles
        ? review.user_profiles.firstname
        : review.reviewer_name || 'Névtelen'

    const reviewDate = new Date(review.created_at).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className={`
      bg-white border border-gray-200 rounded-xl p-6
      ${review.is_featured ? 'ring-2 ring-[var(--pink)]' : ''}
    `}>
            {/* Kiemelt jelző */}
            {review.is_featured && (
                <div className="inline-block bg-[var(--cream-pink)] text-[var(--pink)] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    ⭐ Kiemelt vélemény
                </div>
            )}

            {/* Fejléc: csillagok + név + dátum */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <StarRating rating={review.rating} size="sm" showHalf={false} />
                    <div className="flex items-center gap-2 mt-2">
                        <p className="font-semibold text-gray-900">{reviewerName}</p>
                        {review.is_verified_purchase && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                                <TbShieldCheck className="w-4 h-4" />
                                <span>Ellenőrzött vásárlás</span>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-500">{reviewDate}</p>
            </div>

            {/* Címsor */}
            {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                </h4>
            )}

            {/* Vélemény szöveg */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {review.review_text}
            </p>
        </div>
    )
}
