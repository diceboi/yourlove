"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { TbX, TbChevronLeft, TbSearch, TbCheck } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import UploadImageButton from "../UI/Buttons/UploadImageButton";

const BUCKET = "yourlove";

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  initialSelected = []
}) {
  const supabase = useMemo(() => createClient(), []);
  const [images, setImages] = useState([]); // { name, path, url }
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const fileInputRef = useRef(null);

  // multiple módhoz kijelölések
  const [selected, setSelected] = useState([]); // string[] (url-ek)

  const isImage = (name) => /\.(png|jpe?g|webp|gif|svg|bmp|avif)$/i.test(name);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

    if (!error && data?.length) {
      const items = data
        .filter((it) => isImage(it.name))
        .map((it) => {
          const path = it.name;
          const { data: pub } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);
          return { name: it.name, path, url: pub?.publicUrl };
        })
        .filter((x) => !!x.url);
      setImages(items);
    } else {
      setImages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelected(initialSelected); // nyitáskor ürítjük a kijelölést
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await supabase.storage
      .from(BUCKET)
      .upload(file.name, file, { upsert: true });
    e.target.value = "";
    fetchImages();
  };

  const filtered = q
    ? images.filter((img) => img.name.toLowerCase().includes(q.toLowerCase()))
    : images;

  if (typeof window === "undefined") return null;

  const toggleSelect = (url) => {
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirmMulti = () => {
    if (!selected.length) return;
    onSelect(selected); // tömbet ad vissza
    onClose();
  };

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
            {/* HEADER */}
            <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-1 border-b border-[var(--border)]">
              <div className="flex flex-col md:flex-row justify-between md:items-center w-full gap-0">
                <div className="flex flex-nowrap items-center gap-2 border-b border-[var(--border)] md:border-none">
                  <button
                    className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
                    onClick={onClose}
                  >
                    <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
                  </button>
                  <h1 className="text-xl font-bold w-full p-2 ">Médiatár</h1>
                </div>
                <div className="p-1">
                  <div className="relative w-full mx-auto">
                    <input
                      type="text"
                      placeholder="Kép keresése"
                      className="xl:min-w-[500px] min-w-full py-2 pl-6 pr-10 text-gray-800 bg-white rounded-full outline-none border border-[var(--border)]"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    <TbSearch
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--pink)]"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GRID */}
            <div className="flex-1 overflow-auto p-4 grid md:grid-cols-6 grid-cols-3 gap-3">
              {loading ? (
                <div className="col-span-6 text-center text-sm text-gray-500">
                  Betöltés…
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-6 text-center text-sm text-gray-500">
                  Nincs találat.
                </div>
              ) : (
                filtered.map((img) => {
                  const isSelected = selected.includes(img.url);
                  return (
                    <button
                      key={img.path}
                      onClick={() => {
                        if (multiple) {
                          toggleSelect(img.url);
                        } else {
                          onSelect(img.url); // single: string
                          onClose();
                        }
                      }}
                      className={`relative w-full aspect-square cursor-pointer group border rounded-md overflow-hidden ${
                        multiple && isSelected
                          ? "ring-2 ring-[var(--pink)]"
                          : "border-[var(--border)]"
                      }`}
                      title={img.name}
                    >
                      <Image
                        src={img.url}
                        alt={img.name}
                        fill
                        sizes="150px"
                        className="object-cover group-hover:opacity-80"
                      />
                      {multiple && (
                        <div className="absolute top-1 left-1 bg-white/80 rounded-full p-1 shadow">
                          <TbCheck
                            className={
                              isSelected
                                ? "text-[var(--pink)]"
                                : "text-gray-400"
                            }
                            size={14}
                          />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <UploadImageButton onclick={handleUploadClick} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>

              {multiple && (
                <button
                  type="button"
                  disabled={selected.length === 0}
                  onClick={handleConfirmMulti}
                  className={`px-7 h-[44px] cursor-pointer rounded-full text-sm font-medium border ${
                    selected.length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[var(--pink)] text-white border-[var(--pink)] hover:bg-[var(--pink-hover)] hover:border-[var(--pink-hover)]"
                  }`}
                >
                  {selected.length === 0
                    ? "Nincs kijelölt kép"
                    : `Kijelöltek hozzáadása (${selected.length})`}
                </button>
              )}
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
