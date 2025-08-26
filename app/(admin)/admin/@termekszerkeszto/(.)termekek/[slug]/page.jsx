"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminProductEdit from "@/app/components/admin/AdminProductEdit";

export default function ProductModal() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // az interecepting route-odban a param valószínűleg "slug"
  const raw = params?.slug ?? params?.id;
  const slug = Array.isArray(raw) ? raw[0] : raw;

  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);

      try {
        // 1) próba seo_slug alapján
        let { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("seo_slug", slug)
          .maybeSingle();

        // 2) ha nincs találat és a slug számnak tűnik, próbáld id-re
        if (!data && !error) {
          const asId = Number(slug);
          if (Number.isFinite(asId)) {
            const res2 = await supabase
              .from("products")
              .select("*")
              .eq("id", asId)
              .maybeSingle();
            data = res2.data;
            error = res2.error;
          }
        }

        if (error) {
          console.error("Hiba a termék lekérésekor:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
        }

        if (alive) setProduct(data ?? null);
      } catch (e) {
        console.error("Váratlan hiba a termék lekérésekor:", e);
        if (alive) setProduct(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProduct();
    return () => { alive = false; };
  }, [slug, supabase]);

  if (loading) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés…</p>
      </Modal>
    );
  }

  if (!product) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Nem található termék a(z) “{String(slug)}” alapján.</p>
      </Modal>
    );
  }

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
      <AdminProductEdit product={product} />
    </Modal>
  );
}
