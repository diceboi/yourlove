"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdminPageBuilderModal from "@/app/components/admin/PageBuilder/AdminPageBuilderModal";

export default function CustomPageModal() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const raw = params?.id ?? params?.slug;
  const identifier = Array.isArray(raw) ? raw[0] : raw;

  useEffect(() => {
    let alive = true;

    const fetchPage = async () => {
      if (!identifier) return;
      setLoading(true);

      try {
        // 1) Próba slug alapján
        let { data, error } = await supabase
          .from("custom_pages")
          .select("*")
          .eq("slug", identifier)
          .maybeSingle();

        // 2) ha nincs találat és az identifier számnak tűnik, próbáld id-re
        if (!data && !error) {
          const asId = Number(identifier);
          if (Number.isFinite(asId)) {
            const res2 = await supabase
              .from("custom_pages")
              .select("*")
              .eq("id", asId)
              .maybeSingle();
            data = res2.data;
            error = res2.error;
          }
        }

        if (error) {
          console.error("Hiba az oldal lekérésekor:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
        }

        if (alive) setPage(data ?? null);
      } catch (e) {
        console.error("Váratlan hiba az oldal lekérésekor:", e);
        if (alive) setPage(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchPage();
    return () => { alive = false; };
  }, [identifier, supabase]);

  if (loading) {
    return null; // A modal betölti magát
  }

  if (!page) {
    return null; // Ha nincs oldal, akkor ne jelenítsünk meg semmit
  }

  return <AdminPageBuilderModal page={page} isNew={false} />;
}
