"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminProductCategoriesEdit from "@/app/components/admin/AdminProductCategoriesEdit";

export default function ProductCategoryModal() {
  const params = useParams();
  const router = useRouter();

  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const slugParam = params.slug;

      // Ha dinamikus route tömböt ad vissza, normalizáljuk stringgé
      const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

      const { data, error } = await supabase
        .from("product-categories")
        .select("*")
        .eq("id", slug)
        .single();

      if (error) {
        console.error("Hiba a termék lekérésekor:", error);
      } else {
        setCategory(data);
      }
    };

    if (params.slug) fetchProduct();
  }, [params.slug]);

  if (!category) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés...</p>
      </Modal>
    );
  }

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
      <AdminProductCategoriesEdit category={category} />
    </Modal>
  );
}
