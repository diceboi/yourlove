"use client";

import { useState } from "react";
import { TbX, TbCheck, TbTrash, TbStar, TbShieldCheck, TbExternalLink } from "react-icons/tb";
import { approveReview, rejectReview, toggleFeatureReview } from "@/app/_actions/review";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import StarRating from "@/app/components/UI/StarRating";
import Link from "next/link";

export default function AdminReviewDetail({ review, onClose }) {
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    const reviewerName = review.user_profiles
        ? `${review.user_profiles.lastname} ${review.user_profiles.firstname}`
        : review.reviewer_name || 'Névtelen';

    const reviewDate = new Date(review.created_at).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleApprove = async () => {
        setProcessing(true);
        const result = await approveReview(review.id);
        if (result.ok) {
            toast.success('Vélemény jóváhagyva');
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || 'Hiba történt');
        }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!confirm('Biztosan törlöd ezt a véleményt?')) return;

        setProcessing(true);
        const result = await rejectReview(review.id);
        if (result.ok) {
            toast.success('Vélemény törölve');
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || 'Hiba történt');
        }
        setProcessing(false);
    };

    const handleToggleFeatured = async () => {
        setProcessing(true);
        const result = await toggleFeatureReview(review.id, !review.is_featured);
        if (result.ok) {
            toast.success(review.is_featured ? 'Kiemelés eltávolítva' : 'Vélemény kiemelve');
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || 'Hiba történt');
        }
        setProcessing(false);
    };

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Vélemény részletei</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {reviewDate}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <TbX className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Termék info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Termék</h3>
                    <Link
                        href={
                            review.products.canonical_path
                                ? `/termekek/${review.products.canonical_path}/${review.products.seo_slug}`
                                : `/termekek/${review.products.seo_slug}`
                        }
                        target="_blank"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
                    >
                        {review.products.fo_cim}
                        <TbExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                {/* Értékelés */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Értékelés</h3>
                    <StarRating rating={review.rating} size="lg" showHalf={false} />
                </div>

                {/* Címsor */}
                {review.title && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Címsor</h3>
                        <p className="text-lg font-semibold text-gray-900">{review.title}</p>
                    </div>
                )}

                {/* Vélemény szöveg */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Vélemény</h3>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                        {review.review_text}
                    </p>
                </div>

                {/* Szerző info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Szerző információk</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Név:</span>
                            <span className="text-sm font-medium text-gray-900">{reviewerName}</span>
                            {review.is_verified_purchase && (
                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                    <TbShieldCheck className="w-4 h-4" />
                                    <span>Ellenőrzött vásárlás</span>
                                </div>
                            )}
                        </div>
                        {review.user_profiles?.email && (
                            <div>
                                <span className="text-sm text-gray-600">Email: </span>
                                <span className="text-sm text-gray-900">{review.user_profiles.email}</span>
                            </div>
                        )}
                        {review.reviewer_email && (
                            <div>
                                <span className="text-sm text-gray-600">Email: </span>
                                <span className="text-sm text-gray-900">{review.reviewer_email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Státusz badges */}
                <div className="flex flexwrap gap-2">
                    {review.is_approved ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Jóváhagyva
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Moderálásra vár
                        </span>
                    )}
                    {review.is_featured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                            <TbStar className="w-4 h-4" />
                            Kiemelt
                        </span>
                    )}
                </div>
            </div>

            {/* Footer - Actions */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                    {!review.is_approved && (
                        <button
                            onClick={handleApprove}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            <TbCheck className="w-5 h-5" />
                            Jóváhagy
                        </button>
                    )}
                    {review.is_approved && (
                        <button
                            onClick={handleToggleFeatured}
                            disabled={processing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${review.is_featured
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-pink-600 text-white hover:bg-pink-700'
                                }`}
                        >
                            <TbStar className="w-5 h-5" />
                            {review.is_featured ? 'Kiemelés törlése' : 'Kiemelés'}
                        </button>
                    )}
                    <button
                        onClick={handleReject}
                        disabled={processing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        <TbTrash className="w-5 h-5" />
                        Törlés
                    </button>
                </div>
            </div>
        </div>
    );
}
