// app/components/admin/AdminBlogCreate.jsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import BlogTextEditor from "@/app/components/UI/Inputfield/BlogTextEditor";
import TagsMultiSelect from "@/app/components/UI/Inputfield/TagsMultiSelect";
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect";
import { TbChevronLeft } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

function slugify(s = "") {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// normalizálók mentéshez
const normalizePaths = (paths) =>
  Array.isArray(paths)
    ? paths
        .map((p) =>
          Array.isArray(p) ? p.map((n) => Number(n)).filter(Number.isFinite) : []
        )
        .filter((p) => p.length > 0)
    : [];

const normalizeIds = (ids) =>
  Array.isArray(ids)
    ? Array.from(new Set(ids.map(Number).filter(Number.isFinite)))
    : [];

export default function AdminBlogCreate() {
  const router = useRouter();

  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({
    cim: "",
    slug: "",
    bevezeto: "",
    tartalom: "",
    kep: "",
    kep_alt: "",
    // UI-only mezők a szelektorokhoz:
    kategoriak_paths: [],  // number[][]
    cimkek: [],            // number[]
  });

  // borítókép
  const [selectedImage, setSelectedImage] = useState("");

  // közös Media modal (cover + inline)
  const [mediaOpen, setMediaOpen] = useState(false);
  const pickerModeRef = useRef(null);
  const resolverRef = useRef(null);

  const handleClose = () => router.back();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cim") {
      setForm((prev) => {
        const next = { ...prev, cim: value };
        if (!prev.slug) next.slug = slugify(value);
        return next;
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCoverPicker = () => {
    pickerModeRef.current = "cover";
    setMediaOpen(true);
  };

  const pickImageFromLibrary = () =>
    new Promise((resolve) => {
      pickerModeRef.current = "inline";
      resolverRef.current = resolve;
      setMediaOpen(true);
    });

  const handlePick = (url) => {
    const mode = pickerModeRef.current;
    pickerModeRef.current = null;

    if (mode === "cover") {
      if (url) {
        setSelectedImage(url);
        setForm((prev) => ({ ...prev, kep: url }));
      }
      setMediaOpen(false);
      return;
    }

    if (mode === "inline") {
      if (resolverRef.current) {
        resolverRef.current(url || null);
        resolverRef.current = null;
      }
      setMediaOpen(false);
      return;
    }

    setMediaOpen(false);
  };

  const handleSave = async () => {
    const supabase = createClient();

    const normalizedPaths = normalizePaths(form.kategoriak_paths);
    const tagIds = normalizeIds(form.cimkek);

    const payload = {
      cim: form.cim || null,
      slug: form.slug || slugify(form.cim || ""),
      bevezeto: form.bevezeto || null,
      tartalom: form.tartalom || null,
      kep: selectedImage || null,
      kep_alt: form.kep_alt || null,
      kozzeteve: !!published,
      // DB oszlopok:
      kategoria: JSON.stringify(normalizedPaths), // TEXT/JSON
      cimke: JSON.stringify(tagIds),              // TEXT/JSON
    };

    if (!payload.cim || !payload.slug) {
      toast("Adj meg címet (és slugot)!");
      return;
    }

    const { error } = await supabase
      .from("blogs")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Létrehozási hiba:", error);
      if (error.code === "23505") {
        toast("Már létezik ilyen egyedi érték (pl. slug).");
      } else {
        toast("Hiba történt a mentés során.");
      }
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:blogs:changed"));
    toast.success("Bejegyzés létrehozva!");
    handleClose();
    router.replace("/admin/blogok");
  };

  return (
    <>
      {mediaOpen && (
        <MediaLibraryModal
          isOpen={mediaOpen}
          onClose={() => handlePick(null)}
          onSelect={(imgUrl) => handlePick(imgUrl)}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* Fejléc */}
        <div className="sticky top-0 bg-[#f5f5f5] flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[var(--border)] z-10">
          <div className="flex flex-nowrap gap-2">
            <button
              className="flex justify-center items-start w-12 border-r border-[var(--border)] p-2 hover:bg-[var(--border)]"
              onClick={handleClose}
            >
              <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
            </button>
            <div className="flex lg:flex-row flex-col gap-1 items-center">
              <h1 className="text-xl font-bold p-2">Új blogbejegyzés</h1>
            </div>
          </div>
        </div>

        {/* Törzs */}
        <div className="flex flex-col lg:p-6 p-3 min-h-[100vh] gap-8">
          {/* Főkép */}
          <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
            <div className="relative cursor-pointer group" onClick={openCoverPicker}>
              <Image
                src={selectedImage || "/default.png"}
                width={500}
                height={500}
                alt={form.kep_alt || "blog-kep"}
                className="rounded-lg w-full h-auto group-hover:opacity-70"
              />
              <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                Kép kiválasztása
              </span>
            </div>
            <SmallTextInput
              legend="Kép alt"
              name="kep_alt"
              value={form.kep_alt}
              handleChange={handleChange}
            />
          </div>

          {/* Alapadatok */}
          <div className="space-y-2 w-full">
            <SmallTextInput legend="Cím" name="cim" value={form.cim} handleChange={handleChange} />
            <SmallTextInput legend="Slug" name="slug" value={form.slug} handleChange={handleChange} />
            <Textarea legend="Bevezető" name="bevezeto" value={form.bevezeto} rows={4} handleChange={handleChange} />
          </div>

          {/* Választók */}
          <div className="space-y-4 w-full">
            <TagsMultiSelect
              label="Címkék"
              value={form.cimkek}
              onChange={(ids) => setForm((p) => ({ ...p, cimkek: ids }))}
            />
            <CategoryPathMultiSelect
              label="Kategóriák"
              value={form.kategoriak_paths}
              onChange={(paths) => setForm((p) => ({ ...p, kategoriak_paths: paths }))}
            />
          </div>

          {/* Tartalom (TipTap) */}
          <div className="space-y-2">
            <BlogTextEditor
              legend="Tartalom (blog)"
              value={form.tartalom}
              onChange={(html) => setForm((prev) => ({ ...prev, tartalom: html }))}
              onPickImage={pickImageFromLibrary}
            />
          </div>
        </div>

        {/* Lábléc */}
        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} />
          <div className="flex gap-2">
            <AdminCancelButton title="Mégse" onclick={handleClose} buttonicon="TbX" />
            <AdminSaveButton title="Mentés" onclick={handleSave} buttonicon="TbDeviceFloppy" />
          </div>
        </div>
      </div>
    </>
  );
}
