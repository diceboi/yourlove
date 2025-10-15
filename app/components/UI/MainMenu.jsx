"use client"

import MainMenuItem from "./MainMenuItem";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useState, useCallback } from "react";

export default function MainMenu() {

  const supabase = useMemo(() => createClient(), []);
  const [cats, setCats] = useState([]);

  const fetchTopCats = useCallback(async () => {
    // top-level + publikált
    const { data, error } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo, kep, kozzeteve, icon")
      .or("szulo.is.null,szulo.eq.0")
      .eq("kozzeteve", true)
      .order("nev", { ascending: true });

    if (!error) setCats(data || []);
    // (ha szeretnéd: else-ben log/toast)
  }, [supabase]);

  useEffect(() => {
    fetchTopCats();
  }, [fetchTopCats]);

  return (
      <div className="flex flex-row items-end justify-start gap-4 border-b border-[var(--border)] w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto bg-white z-10 -mt-1">
        {/* Dinamikus fő kategóriák */}
        {cats.map((c) => (
          <MainMenuItem
            key={c.id}
            title={c.nev}
            icon={c.icon || undefined}        // ha van ikon/kép, megjelenik
            onclick={c.slug}                 // a komponensed eddig stringet kapott
          />
        ))}
      </div>
  );
}
