// UI/MobileMenuDrawer.jsx
"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TbChevronLeft, TbX } from "react-icons/tb";
import { MenuContext } from "@/app/MenuContext";
import { createClient } from "@/utils/supabase/client";

export default function MobileMenuDrawer() {
  const { isMobileOpen, closeMobileMenu } = useContext(MenuContext);
  const supabase = useMemo(() => createClient(), []);

  // view state
  const [level, setLevel] = useState(0); // 0=topcats, 1=children/fallback
  const [direction, setDirection] = useState(1); // 1 balról->jobbra, -1 jobbról->balra

  // data
  const [topCats, setTopCats] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  const [parentCat, setParentCat] = useState(null);
  const [childrenCats, setChildrenCats] = useState([]);
  const [fallbackProducts, setFallbackProducts] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // --- animációs variánsok ---
  const pageVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };
  const pageTransition = { type: "tween", duration: 0.28, ease: "easeInOut" };

  // felső kategóriák (publikált, top-level)
  const fetchTopCats = useCallback(async () => {
    setLoadingTop(true);
    const { data, error } = await supabase
      .from("product-categories")
      .select("id, nev, slug, icon, kep, szulo, kozzeteve")
      .or("szulo.is.null,szulo.eq.0")
      .eq("kozzeteve", true)
      .order("nev", { ascending: true });
    setTopCats(error ? [] : (data || []));
    setLoadingTop(false);
  }, [supabase]);

  // alkategóriák vagy fallback termékek a kiválasztott parent alapján
  const loadDetailForParent = useCallback(async (parent) => {
    if (!parent) return;
    setLoadingDetail(true);
    setParentCat(parent);
    setChildrenCats([]);
    setFallbackProducts([]);

    const { data: kids, error: kErr } = await supabase
      .from("product-categories")
      .select("id, nev, slug, szulo, kep, icon, kozzeteve")
      .eq("szulo", parent.id)
      .eq("kozzeteve", true)
      .order("nev", { ascending: true });

    if (!kErr && kids?.length) {
      setChildrenCats(kids);
      setLoadingDetail(false);
      return;
    }

    // fallback: termékek a kategóriában
    const { data: prods, error: pErr } = await supabase
      .from("products")
      .select("id, fo_cim, seo_slug, termekkep, kategoria, kozzeteve")
      .eq("kozzeteve", true)
      .order("kattintasok", { ascending: false })
      .limit(24);

    if (!pErr && prods?.length) {
      const filtered = prods.filter((p) => {
        try {
          const paths = JSON.parse(p.kategoria);
          return Array.isArray(paths) && paths.some((path) => Array.isArray(path) && path.includes(parent.id));
        } catch { return false; }
      });
      setFallbackProducts(filtered);
    }
    setLoadingDetail(false);
  }, [supabase]);

  // drawer nyitáskor töltsük be a top kategóriákat
  useEffect(() => {
    if (isMobileOpen) {
      fetchTopCats();
      setLevel(0);
    }
  }, [isMobileOpen, fetchTopCats]);

  // navigáció a részletekbe
  const goInto = async (parent) => {
    setDirection(1);
    await loadDetailForParent(parent);
    setLevel(1);
  };

  const goBack = () => {
    setDirection(-1);
    setLevel(0);
  };

  // helper csempe
  const Tile = ({ title, image, href, onClick, rightChevron, classname }) => (
    <Link
      href={href || "#"}
      onClick={(e) => {
        if (!href) e.preventDefault();
        onClick?.(e);
        if (href) closeMobileMenu();
      }}
      className={`flex items-center gap-2 pl-3 border-b border-[var(--border)] bg-white active:bg-gray-50 ${classname}`}
    >
      <div className="w-10 h-10 overflow-hidden bg-white flex items-center justify-center">
        {image ? (
          <Image src={image} alt={title} width={40} height={40} className="object-contain w-10 h-10" />
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>
      <div className="flex-1 font-medium truncate p-3">{title}</div>
      {rightChevron ? <TbChevronLeft className="-scale-x-100 opacity-70" /> : null}
    </Link>
  );

  // a MobileMenuDrawer komponensen BELÜL, a Tile mellé tedd:
const TwoActionTile = ({ title, image, href, onChevron, classname }) => (
  <div
    className={`flex items-center gap-2 pl-3 border-b border-[var(--border)] bg-white active:bg-gray-50 ${classname}`}
    role="group"
  >
    <div className="w-10 h-10 overflow-hidden bg-white flex items-center justify-center">
      {image ? (
        <Image
          src={image}
          alt={title}
          width={40}
          height={40}
          className="object-contain w-10 h-10"
        />
      ) : (
        <div className="w-8 h-8" />
      )}
    </div>

    {/* CÍM: archív link – bezárja a menüt */}
    <Link
      href={href}
      onClick={() => closeMobileMenu()}
      className="flex-1 font-medium truncate p-3"
    >
      {title}
    </Link>

    {/* NYÍL: almenü betöltése – NEM zár menüt */}
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onChevron?.(e);
      }}
      aria-label="Almenü megnyitása"
      className=" hover:bg-gray-100 shrink-0 border-l border-[var(--border)] h-full px-3"
    >
      <TbChevronLeft className="-scale-x-100 opacity-70 w-11 h-5" />
    </button>
  </div>
);


  // overlay + drawer konténer
  return (
    <AnimatePresence>
      {isMobileOpen && (
        <motion.div
          className="fixed flex inset-0 z-[999] xl:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* háttér */}
          <div className="absolute inset-0 bg-black/35" onClick={closeMobileMenu} />

          {/* fiók */}
          <motion.aside
            className="relative ml-auto bg-white flex flex-col w-[90vw] h-full"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* fejléc */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border)]">
              {level === 0 ? (
                <div className="text-base font-semibold">Menü</div>
              ) : (
                <button onClick={goBack} className="p-2 -ml-2 rounded hover:bg-gray-100">
                  <TbChevronLeft className="w-6 h-6" />
                </button>
              )}
              <button onClick={closeMobileMenu} className="p-2 rounded hover:bg-gray-100">
                <TbX className="w-6 h-6" />
              </button>
            </div>

            {/* tartalom – egész oldal váltás balról/jobbról */}
            <div className="relative flex-1 overflow-y-auto">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {level === 0 ? (
                  <motion.div
                    key="level-0"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="grid grid-cols-1"
                  >
                    {loadingTop ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-xl bg-[var(--border)] animate-pulse" />
                        ))
                        ) : (
                        <>
                            {topCats.map((c) => (
                            <TwoActionTile
                                key={c.id}
                                title={c.nev}
                                image={c.icon || c.kep || "/default.png"}
                                href={`/termekek/${encodeURIComponent(c.slug)}`} // ← archív
                                onChevron={() => goInto(c)}                     // ← almenü
                            />
                            ))}
                            {/* statikus oldalak maradhatnak sima linkes Tile-ként */}
                            <Tile title="Blog" image="/default.png" href="/blog" />
                            <Tile title="GYIK" image="/default.png" href="/gyik" />
                            <Tile title="Rólunk" image="/default.png" href="/rolunk" />
                            <Tile title="Kapcsolat" image="/default.png" href="/kapcsolat" />
                        </>
                    )}

                  </motion.div>
                ) : (
                  <motion.div
                    key="level-1"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="grid grid-cols-1"
                  >
                    {/* szülő kategória csempe mindig elsőnek */}
                    {parentCat && (
                      <Tile
                        title={`${parentCat.nev} kategória`}
                        image={parentCat.kep || parentCat.icon || "/default.png"}
                        href={`/termekek/${encodeURIComponent(parentCat.slug)}`}
                        classname={"font-bold bg-[var(--error)]"}
                      />
                    )}

                    {loadingDetail ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-[var(--border)] animate-pulse" />
                      ))
                    ) : childrenCats.length ? (
                      childrenCats.map((c) => (
                        <Tile
                          key={c.id}
                          title={c.nev}
                          image={c.kep || c.icon || "/default.png"}
                          href={`/termekek/${encodeURIComponent(parentCat?.slug || "")}/${encodeURIComponent(c.slug)}`}
                        />
                      ))
                    ) : fallbackProducts.length ? (
                      fallbackProducts.map((p) => (
                        <Tile
                          key={p.id}
                          title={p.fo_cim}
                          image={p.termekkep || "/default.png"}
                          href={`/termekek/${encodeURIComponent(parentCat?.slug || "")}/${encodeURIComponent(p.seo_slug)}`}
                        />
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-2">Nincs megjeleníthető elem.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
