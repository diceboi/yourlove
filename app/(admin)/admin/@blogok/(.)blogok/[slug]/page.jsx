"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/app/components/UI/Modal";
import { createClient } from "@/utils/supabase/client";
import AdminBlogEdit from "@/app/components/admin/AdminBlogEdit";

export default function ProductBlogsModal() {
  const params = useParams();
  const router = useRouter();

  const [blogs, setBlogs] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const supabase = createClient();
      const slugParam = params.slug;

      // Ha dinamikus route tömböt ad vissza, normalizáljuk stringgé
      const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", slug)
        .single();

      if (error) {
        console.error("Hiba a blogok lekérésekor:", error);
      } else {
        setBlogs(data);
      }
    };

    if (params.slug) fetchBlogs();
  }, [params.slug]);

  if (!blogs) {
    return (
      <Modal openstate={true} onClose={() => router.back()}>
        <p>Betöltés...</p>
      </Modal>
    );
  }

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
      <AdminBlogEdit blog={blogs} />
    </Modal>
  );
}
