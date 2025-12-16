"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import H3 from "@/app/components/UI/Texts/H3";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import AdminDeleteButton from "@/app/components/UI/Buttons/AdminDeleteButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect";
import TagsMultiSelect from "@/app/components/UI/Inputfield/TagsMultiSelect";
import { createClient } from "@/utils/supabase/client";
import { TbChevronLeft, TbAlignJustified, TbSeo, TbPackage } from "react-icons/tb";

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

export default function AdminCustomPageEdit({ page }) {
  const router = useRouter();
  if (!page) return <div className="p-6">Betöltés...</div>;

  const initialCategories = useMemo(() => {
    return toPathArray(page.termek_kategoria_ids || []);
  }, [page]);

  const initialTags = useMemo(() => {
    return toIdArray(page.termek_cimke_ids || []);
  }, [page]);

  const [published, setPublished] = useState(!!page.kozzeteve);
  const [form, setForm] = useState({
    ...page,
    leiras: page.leiras || "",
    fokep_alt: page.fokep_alt || "",
    meta_title: page.meta_title || "",
    meta_leiras: page.meta_leiras || "",
    termek_kategoria_ids: initialCategories,
    termek_cimke_ids: initialTags,
  });

  const [selectedImage, setSelectedImage] = useState(page.fokep || "");
  const [mediaOpen, setMediaOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    const normalizedCategories = Array.isArray(form.termek_kategoria_ids)
      ? form.termek_kategoria_ids
          .map((p) =>
            Array.isArray(p)
              ? p.map((n) => Number(n)).filter(Number.isFinite)
              : []
          )
          .filter((p) => p.length > 0)
      : [];

    const tagIds = Array.isArray(form.termek_cimke_ids)
      ? Array.from(new Set(form.termek_cimke_ids.map(Number).filter(Number.isFinite)))
      : [];

    const {
      id,
      created_at,
      updated_at,
      termek_kategoria_ids: _uiCats,
      termek_cimke_ids: _uiTags,
      ...rest
    } = form || {};

    const payload = {
      ...rest,
      kozzeteve: !!published,
      fokep: selectedImage || null,
      termek_kategoria_ids: JSON.stringify(normalizedCategories),
      termek_cimke_ids: JSON.stringify(tagIds),
    };

    let q = supabase.from("custom_pages").update(payload);
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else q = q.eq("slug", form.slug);

    const { error } = await q.select().maybeSingle();
    if (error) {
      console.error("Mentési hiba:", error);
      toast.error("Hiba történt a mentés során.");
      return;
    }

    setForm(prev => ({
      ...prev,
      termek_kategoria_ids: normalizedCategories,
      termek_cimke_ids: tagIds,
    }));

    window.dispatchEvent(new CustomEvent("admin:custom_pages:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  const handleDelete = async () => {
    const supabase = createClient();

    let q = supabase.from("custom_pages").delete();
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else if (form.slug) q = q.eq("slug", form.slug);
    else {
      toast.error("Hiba: nincs megadva törölhető azonosító.");
      return;
    }

    const { error } = await q;
    if (error) {
      console.error("Törlési hiba:", error);
      toast.error("Hiba történt a törlés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:custom_pages:changed"));
    toast.success("Oldal törölve.");
    router.push("/admin/oldalkeszito");
    router.refresh();
  };

  const handleClose = () => router.back();

  return (
    <>
      {mediaOpen && (
        <MediaLibraryModal
          isOpen={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={(imgUrl) => {
            if (imgUrl) {
              setSelectedImage(imgUrl);
              setForm((prev) => ({ ...prev, fokep: imgUrl }));
            }
            setMediaOpen(false);
          }}
        />
      )}

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
              <h1 className="text-xl font-bold">{form.cim || ""}</h1>
              <span className="text-sm text-gray-500">ID: {form.id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row lg:p-6 p-3 gap-8">
          {/* Hero Image */}
          <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
            <div className="relative cursor-pointer group" onClick={() => setMediaOpen(true)}>
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
            />
            <SmallTextInput
              legend="Slug (URL)"
              name="slug"
              value={form.slug || ""}
              handleChange={handleChange}
            />
            <Textarea
              legend="Leírás"
              name="leiras"
              value={form.leiras || ""}
              handleChange={handleChange}
              rows={4}
            />
            <SmallTextInput
              legend="Főkép alt szöveg"
              name="fokep_alt"
              value={form.fokep_alt || ""}
              handleChange={handleChange}
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
          />
          <Textarea
            legend="Meta leírás"
            handleChange={handleChange}
            name="meta_leiras"
            value={form.meta_leiras || ""}
            rows={3}
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
            <AdminDeleteButton title="Törlés" onconfirm={handleDelete} buttonicon="TbTrash" />
            <AdminSaveButton title="Mentés" onclick={handleSave} buttonicon="TbDeviceFloppy" />
          </div>
        </div>
      </div>
    </>
  );
}
