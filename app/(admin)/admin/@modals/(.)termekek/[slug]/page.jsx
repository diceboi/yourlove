"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminProductEdit from "@/app/components/admin/AdminProductEdit";

export default function ProductModal() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const slugParam = params.slug;

      // Ha dinamikus route tömböt ad vissza, normalizáljuk stringgé
      const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seo_slug", slug)
        .single();

      if (error) {
        console.error("Hiba a termék lekérésekor:", error);
      } else {
        setProduct(data);
      }
    };

    if (params.slug) fetchProduct();
  }, [params.slug]);

  if (!product) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés...</p>
      </Modal>
    );
  }

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
      <AdminProductEdit product={product} />
    </Modal>
  );
}
