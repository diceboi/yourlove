"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import H3 from "@/app/components/UI/Texts/H3";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect";
import TagsMultiSelect from "@/app/components/UI/Inputfield/TagsMultiSelect";
import { createClient } from "@/utils/supabase/client";
import { TbChevronLeft, TbAlignJustified, TbSeo, TbPackage } from "react-icons/tb";

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

function toIdArray(v) {
  try {
    if (Array.isArray(v)) return v.map(Number).filter(Number.isFinite);
    if (typeof v === "string" && v.trim()) {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isFinite);
    }
  } catch {}
  return [];
}

function toPathArray(v) {
  try {
    if (Array.isArray(v)) {
      return v
        .map(p => Array.isArray(p) ? p.map(n => Number(n)).filter(Number.isFinite) : [])
        .filter(p => p.length > 0);
    }
    if (typeof v === "string" && v.trim()) {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        return parsed
          .map(p => Array.isArray(p) ? p.map(n => Number(n)).filter(Number.isFinite) : [])
          .filter(p => p.length > 0);
      }
    }
  } catch {}
  return [];
}

export default function AdminCustomPageCreate({ onClose }) {
  const router = useRouter();

  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({
    cim: "",
    slug: "",
    leiras: "",
    fokep_alt: "",
    meta_title: "",
    meta_leiras: "",
    termek_kategoria_ids: [],
    termek_cimke_ids: []
  });
  const [selectedImage, setSelectedImage] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cim") {
      setForm((prev) => {
        const next = { ...prev, cim: value };
        if (!prev.slug) next.slug = slugify(value);
        if (!prev.meta_title) next.meta_title = value;
        return next;
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    // Normalizálás
    const categoryPaths = toPathArray(form.termek_kategoria_ids);
    const tagIds = toIdArray(form.termek_cimke_ids);

    const payload = {
      cim: form.cim || null,
      slug: form.slug || slugify(form.cim || ""),
      leiras: form.leiras || null,
      fokep: selectedImage || null,
      fokep_alt: form.fokep_alt || null,
      meta_title: form.meta_title || form.cim || null,
      meta_leiras: form.meta_leiras || null,
      termek_kategoria_ids: JSON.stringify(categoryPaths),
      termek_cimke_ids: JSON.stringify(tagIds),
      kozzeteve: !!published,
    };

    if (!payload.slug) {
      toast("Adj meg címet vagy slug-ot!");
      return;
    }

    const { error } = await supabase
      .from("custom_pages")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Mentési hiba:", error);
      toast.error("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:custom_pages:changed"));
    toast.success("Sikeres mentés!");
    handleClose();
    router.refresh();
  };

  return (
    <>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(img) => {
          if (img) {
            setSelectedImage(img);
            setForm((prev) => ({ ...prev, fokep: img }));
          }
          setMediaModalOpen(false);
        }}
      />
      
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="sticky top-0 bg-[#f5f5f5] flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[var(--border)] z-10">
          <div className="flex flex-nowrap gap-2">
            <button
              className="flex justify-center items-start w-12 border-r border-[var(--border)] p-2 hover:bg-[var(--border)]"
              onClick={handleClose}
            >
              <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
            </button>
            <div className="flex lg:flex-row flex-col gap-1 items-center">
              <h1 className="text-xl font-bold p-2">
                {form.cim || "Új oldal"}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row lg:p-6 p-3 gap-8">
          {/* Hero Image */}
          <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
            <div
              className="relative cursor-pointer group"
              onClick={() => setMediaModalOpen(true)}
            >
              <Image
                src={selectedImage || "/default.png"}
                width={500}
                height={500}
                alt={form.fokep_alt || "oldal-fokep"}
                className="rounded-lg w-full h-auto group-hover:opacity-70"
              />
              <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                Kép módosítása
              </span>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2 md:w-1/2">
            <div className="flex flex-nowrap gap-2 items-start mb-4">
              <TbAlignJustified className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
              <H3>Általános</H3>
            </div>
            <SmallTextInput
              legend="Cím"
              name="cim"
              value={form.cim || ""}
              handleChange={handleChange}
              placeholder="Oldal címe"
            />
            <SmallTextInput
              legend="Slug (URL)"
              name="slug"
              value={form.slug || ""}
              handleChange={handleChange}
              placeholder="url-slug"
            />
            <Textarea
              legend="Leírás"
              name="leiras"
              value={form.leiras || ""}
              handleChange={handleChange}
              rows={4}
              placeholder="Az oldal főbb tartalma..."
            />
            <SmallTextInput
              legend="Főkép alt szöveg"
              name="fokep_alt"
              value={form.fokep_alt || ""}
              handleChange={handleChange}
              placeholder="Kép leírása SEO-hoz"
            />
          </div>
        </div>

        {/* Product Selection */}
        <div className="space-y-2 px-6">
          <div className="flex flex-nowrap gap-2 items-start mb-4">
            <TbPackage className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
            <H3>Termékek</H3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Válaszd ki, hogy mely kategóriák vagy címkék alapján jelenjenek meg a termékek ezen az oldalon.
          </p>
          <CategoryPathMultiSelect
            label="Termékkategóriák"
            value={form.termek_kategoria_ids || []}
            onChange={(paths) =>
              setForm((prev) => ({ ...prev, termek_kategoria_ids: paths }))
            }
            from="product-categories"
          />
          <TagsMultiSelect
            label="Termékcímkék"
            value={form.termek_cimke_ids || []}
            onChange={(ids) =>
              setForm((p) => ({ ...p, termek_cimke_ids: ids }))
            }
            from="product-tags"
          />
        </div>

        {/* SEO */}
        <div className="space-y-2 w-full px-6">
          <div className="flex flex-nowrap gap-2 items-start mb-4">
            <TbSeo className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
            <H3>SEO</H3>
          </div>
          <SmallTextInput
            legend="Meta title"
            handleChange={handleChange}
            name="meta_title"
            value={form.meta_title || ""}
            placeholder="SEO cím keresőmotorokhoz"
          />
          <Textarea
            legend="Meta leírás"
            handleChange={handleChange}
            name="meta_leiras"
            value={form.meta_leiras || ""}
            rows={3}
            placeholder="Rövid leírás keresőmotorokhoz"
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch
            checked={published}
            onChange={setPublished}
            firstlabel="Vázlat"
            secondlabel="Közzétéve"
          />
          <div className="flex gap-2">
            <AdminCancelButton title="Mégse" onclick={handleClose} buttonicon="TbX" />
            <AdminSaveButton title="Mentés" onclick={handleSave} buttonicon="TbDeviceFloppy" />
          </div>
        </div>
      </div>
    </>
  );
}
