"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminOrderEdit from "@/app/components/admin/AdminOrderEdit";

export default function OrdersModal() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // az interecepting route-odban a param valószínűleg "slug"
  const raw = params?.slug ?? params?.id;
  const slug = Array.isArray(raw) ? raw[0] : raw;

  useEffect(() => {
    let alive = true;

    const fetchOrder = async () => {
      if (!slug) return;
      setLoading(true);

      try {
        // 1) próba seo_slug alapján
        let { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", slug)
          .maybeSingle();

        if (error) {
          console.error("Hiba a rendelés lekérésekor:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
        }

        if (alive) setOrder(data ?? null);
      } catch (e) {
        console.error("Váratlan hiba a rendelés lekérésekor:", e);
        if (alive) setOrder(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchOrder();
    return () => { alive = false; };
  }, [slug, supabase]);

  if (loading) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés…</p>
      </Modal>
    );
  }

  if (!order) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Nem található rendelés a(z) “{String(slug)}” alapján.</p>
      </Modal>
    );
  }

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
      <AdminOrderEdit orders={order} />
    </Modal>
  );
}
