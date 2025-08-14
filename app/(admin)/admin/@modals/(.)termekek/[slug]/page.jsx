"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/app/components/UI/Modal";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import H2 from "@/app/components/UI/Texts/H2";
import { createClient } from "@/utils/supabase/client";
import AdminProductEdit from "@/app/components/admin/AdminProductEdit";

export default function ProductModal() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const slug = params.slug;

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

    if (params.slug?.length) {
      fetchProduct();
    }
  }, [params.slug]);

  if (!product) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés...</p>
      </Modal>
    );
  }

  return (
    <>
      <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
        <AdminProductEdit product={product} />
      </Modal>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(img) => {
          setSelectedImage(img);
          setProduct((prev) => ({ ...prev, termekkep: img }));
        }}
      />
    </>
  );
}
