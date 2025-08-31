"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminProductTagsEdit from "@/app/components/admin/AdminProductTagsEdit";

export default function ProductTagsModal() {
  const params = useParams();
  const router = useRouter();

  const [tags, setTags] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const slugParam = params.slug;

      // Ha dinamikus route tömböt ad vissza, normalizáljuk stringgé
      const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

      const { data, error } = await supabase
        .from("product-tags")
        .select("*")
        .eq("id", slug)
        .single();

      if (error) {
        console.error("Hiba a termék lekérésekor:", error);
      } else {
        setTags(data);
      }
    };

    if (params.slug) fetchProduct();
  }, [params.slug]);

  if (!tags) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés...</p>
      </Modal>
    );
  }

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
      <AdminProductTagsEdit tags={tags} />
    </Modal>
  );
}
