"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { TbChevronLeft, TbSearch } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "yourlove";
const ICONS_PREFIX = "icons"; // a bucketben: yourlove/icons/...

export default function SupabaseIconLibraryModal({
  isOpen,
  onClose,
  onSelect,
  allowUpload = true,         // ha nem kell feltöltés: false
}) {
  const supabase = useMemo(() => createClient(), []);
  const [icons, setIcons] = useState([]);   // { name, path, url }
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const fileInputRef = useRef(null);

  const isSvg = (name) => /\.svg$/i.test(name);

  const fetchIcons = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(ICONS_PREFIX, { limit: 1000, sortBy: { column: "name", order: "asc" } });

    if (!error && data?.length) {
      const items = data
        .filter((it) => isSvg(it.name))
        .map((it) => {
          const path = `${ICONS_PREFIX}/${it.name}`;
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
          return { name: it.name, path, url: pub?.publicUrl };
        })
        .filter((x) => !!x.url);
      setIcons(items);
    } else {
      setIcons([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchIcons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filtered = q
    ? icons.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
    : icons;

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSvg(file.name)) {
      alert("Csak .svg fájl tölthető fel az ikon könyvtárba.");
      e.target.value = "";
      return;
    }
    const targetPath = `${ICONS_PREFIX}/${file.name}`;
    await supabase.storage.from(BUCKET).upload(targetPath, file, { upsert: true });
    e.target.value = "";
    fetchIcons();
  };

  if (typeof window === "undefined") return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          className="fixed inset-0 z-[999] flex justify-end bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white w-[80%] max-h-[100vh] overflow-y-auto shadow-xl"
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fejléc + kereső */}
            <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between md:flex-row gap-4 border-b border-[var(--border)]">
              <div className="flex flex-nowrap items-center gap-2 border-b border-[var(--border)] md:border-none">
                <button
                  className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 hover:bg-[var(--border)]"
                  onClick={onClose}
                >
                  <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
                </button>
                <h1 className="text-xl font-bold p-2">Ikonok</h1>
              </div>
              <div className="p-1">
                <div className="relative w-full mx-auto">
                  <input
                    type="text"
                    placeholder="Ikon keresése"
                    className="xl:min-w-[500px] min-w-full py-2 pl-6 pr-10 text-gray-800 bg-white rounded-full outline-none border border-[var(--border)]"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <TbSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pink)]" size={20} />
                </div>
              </div>
            </div>

            {/* Rács */}
            <div className="p-4 grid md:grid-cols-8 grid-cols-4 gap-3">
              {loading ? (
                <div className="col-span-full text-center text-sm text-gray-500">Betöltés…</div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full text-center text-sm text-gray-500">Nincs találat.</div>
              ) : (
                filtered.map((ico) => (
                  <button
                    key={ico.path}
                    onClick={() => { onSelect?.(ico.url); onClose?.(); }}
                    className="relative w-full aspect-square cursor-pointer group border border-[var(--border)] rounded-md hover:bg-gray-50"
                    title={ico.name}
                  >
                    <Image
                      src={ico.url}
                      alt={ico.name}
                      fill
                      sizes="120px"
                      className="object-contain p-4"
                    />
                    <span className="absolute inset-x-0 bottom-1 text-[10px] text-center text-gray-500 px-1 truncate">
                      {ico.name}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Feltöltés (opcionális) */}
            {allowUpload && (
              <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50 text-sm"
                >
                  Új ikon feltöltése (.svg)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/svg+xml"
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>
            )}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
