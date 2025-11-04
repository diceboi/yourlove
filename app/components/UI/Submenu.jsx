"use client";

import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
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
  const [parentCat, setParentCat] = useState(null);
  const [childrenCats, setChildrenCats] = useState([]);
  const [fallbackProducts, setFallbackProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSecondaryCats = useCallback(async (parentSlug) => {
    setParentCat(null);
    setChildrenCats([]);
    setFallbackProducts([]);

    if (!parentSlug) return;

    setLoading(true);

    // 1) parent lekérés slug alapján
    const { data: parent, error: pErr } = await supabase
      .from("product-categories")
      .select("id, slug, nev, kep, icon, kozzeteve")
      .eq("slug", String(parentSlug).toLowerCase())
      .maybeSingle();

    if (pErr || !parent) {
      setLoading(false);
      return;
    }
    setParentCat(parent);

    // 2) gyerekek
    const { data: kids, error: kErr } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo, kep, icon, kozzeteve")
      .eq("szulo", parent.id)
      .eq("kozzeteve", true)
      .order("nev", { ascending: true });

    if (!kErr && kids?.length) {
      setChildrenCats(kids);
      setLoading(false);
      return;
    }

    // 3) fallback termékek, ha nincs gyerek
    const { data: prods, error: prodErr } = await supabase
      .from("products")
      .select("id, fo_cim, seo_slug, canonical_slug, termekkep, kategoria, kozzeteve")
      .eq("kozzeteve", true)
      .order("kattintasok", { ascending: false })
      .limit(24);

    if (!prodErr && prods?.length) {
      const filtered = prods.filter((p) => {
        try {
          const paths = JSON.parse(p.kategoria);
          return Array.isArray(paths) && paths.some((path) => Array.isArray(path) && path.includes(parent.id));
        } catch {
          return false;
        }
      });
      setFallbackProducts(filtered);
    }

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

  // csak akkor nyíljon le, ha VAN tartalom (és ne is villanjon loading közben)
  const hasContent = childrenCats.length > 0 || fallbackProducts.length > 0;
  const shouldShow = Boolean(subMenu) && hasContent;

  // slides csak akkor épül, ha van tartalom
  const slides = [];
  if (shouldShow && parentCat) {
    slides.push({
      type: "parent",
      id: `parent-${parentCat.id}`,
      title: `${parentCat.nev} kategória`,
      image: parentCat.kep || parentCat.icon || "/default.png",
      href: `/termekek/${encodeURIComponent(parentCat.slug)}`,
    });
  }

  if (shouldShow && childrenCats.length) {
    slides.push(
      ...childrenCats.map((c) => ({
        type: "category",
        id: `cat-${c.id}`,
        title: c.nev,
        image: c.kep || c.icon || "/default.png",
        href: `/termekek/${encodeURIComponent(parentCat?.slug || "")}/${encodeURIComponent(c.slug)}`,
      }))
    );
  } else if (shouldShow && fallbackProducts.length) {
    slides.push(
      ...fallbackProducts.map((p) => ({
        type: "product",
        id: `prod-${p.id}`,
        title: `${p.fo_cim}`,
        image: p.termekkep || "/default.png",
        href: `/termekek/${canonical_slug || ""}/${p.seo_slug}`,
      }))
    );
  }

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
            {slides.map((item, idx) => (
              <SwiperSlide
                key={item.id}
                className="first:border-r first:border-[var(--border)] first:pr-4 first:font-bold"
              >
                <SubmenuItem title={item.title} image={item.image} href={item.href} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
