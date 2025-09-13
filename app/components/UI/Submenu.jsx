"use client";

import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import SubmenuItem from "./SubmenuItem";
import { MenuContext } from "../../MenuContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function Submenu() {
  const { subMenu, cancelCloseSubmenu, scheduleCloseSubmenu } = useContext(MenuContext);
  const supabase = useMemo(() => createClient(), []);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSecondaryCats = useCallback(async (parentSlug) => {
    if (!parentSlug) { setCats([]); return; }

    setLoading(true);

    // 1) szülő lekérése slug alapján
    const { data: parent, error: pErr } = await supabase
      .from("product-categories")
      .select("id, slug")
      .eq("slug", String(parentSlug).toLowerCase())
      .maybeSingle();

    if (pErr || !parent) {
      setCats([]);
      setLoading(false);
      return;
    }

    // 2) gyerekek, ahol szulo = parent.id és közzétéve = true
    const { data, error } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo, kep, kozzeteve, icon")
      .eq("szulo", parent.id)
      .eq("kozzeteve", true)
      .order("nev", { ascending: true });

    setCats(error ? [] : (data || []));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSecondaryCats(subMenu);
  }, [subMenu, fetchSecondaryCats]);

  const breakpoints = {
    0: { slidesPerView: 2.5, spaceBetween: 8 },
    640: { slidesPerView: 4, spaceBetween: 12 },
    1024: { slidesPerView: 11, spaceBetween: 16 },
  };

  // jelenjen meg a sáv, ha van aktív szülő slug
  const shouldShow = Boolean(subMenu);

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.25, type: "spring", bounce: 0.25 }}
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={() => scheduleCloseSubmenu(450)}
          className="w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto"
        >
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            navigation
            className="w-full my-4"
            breakpoints={breakpoints}
          >
            {(loading ? Array.from({ length: 8 }).map((_, i) => ({ id: `sk-${i}` })) : cats).map((cat, idx) => (
              <SwiperSlide key={loading ? `sk-${idx}` : cat.id}>
                {loading ? (
                  <div className="w-full aspect-square rounded-xl bg-[var(--border)] animate-pulse" />
                ) : cats.length ? (
                  <SubmenuItem
                    title={cat.nev}
                    image={cat.kep || cat.icon || "/default.png"}
                    // ha kattintható legyen:
                    href={`/termekek/${encodeURIComponent(String(subMenu))}/${encodeURIComponent(cat.slug)}`}
                  />
                ) : (
                  <div className="w-full aspect-square rounded-xl border border-[var(--border)] flex items-center justify-center text-sm text-gray-500">
                    Nincs alkategória
                  </div>
                )}
              </SwiperSlide>
            ))}
            {!loading && cats.length === 0 && (
              <SwiperSlide key="empty">
                <div className="w-full aspect-square rounded-xl border border-[var(--border)] flex items-center justify-center text-sm text-gray-500">
                  Nincs alkategória
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
