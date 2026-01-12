"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminReviewDetail from "@/app/components/admin/AdminReviewDetail";

export default function ReviewModal() {
    const router = useRouter();
    const params = useParams();
    const supabase = useMemo(() => createClient(), []);

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    const reviewId = params?.id;

    useEffect(() => {
        let alive = true;

        const fetchReview = async () => {
            if (!reviewId) return;
            setLoading(true);

            try {
                const { data, error } = await supabase
                    .from("product_reviews")
                    .select(`
            *,
            user_profiles!product_reviews_user_id_fkey (
              firstname,
              lastname,
              email
            ),
            products (
              id,
              fo_cim,
              seo_slug,
              canonical_path
            )
          `)
                    .eq("id", reviewId)
                    .single();

                if (error) {
                    console.error("Hiba a vélemény lekérdezésekor:", error);
                    setReview(null);
                } else if (alive) {
                    setReview(data);
                }
            } catch (err) {
                console.error("Váratlan hiba:", err);
            } finally {
                if (alive) setLoading(false);
            }
        };

        fetchReview();

        return () => {
            alive = false;
        };
    }, [reviewId, supabase]);

    const handleClose = () => {
        router.push("/admin/velemenyek");
    };

    return (
        <Modal openstate={true} onClose={handleClose} width="max-w-4xl">
            {loading ? (
                <div className="p-8 text-center">
                    <p className="text-gray-500">Betöltés...</p>
                </div>
            ) : review ? (
                <AdminReviewDetail review={review} onClose={handleClose} />
            ) : (
                <div className="p-8 text-center">
                    <p className="text-gray-600">Vélemény nem található</p>
                </div>
            )}
        </Modal>
    );
}
