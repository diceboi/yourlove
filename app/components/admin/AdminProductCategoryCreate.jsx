"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { TbChevronLeft, TbSeo, TbAlignJustified } from "react-icons/tb";
import H3 from "@/app/components/UI/Texts/H3";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import CategorySelectInput from "@/app/components/UI/Inputfield/CategorySelectInput";
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

export default function AdminProductCategoryCreate({ onClose }) {
  const router = useRouter();
  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({
    nev: "",
    slug: "",
    szulo: null,          // parent id (number) vagy null
    leiras_fent: "",
    leiras_lent: "",
    kep_alt: "",
    og_image: "",
  });
  const [selectedImage, setSelectedImage] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nev") {
      setForm((prev) => {
        const next = { ...prev, nev: value };
        if (!prev.slug) next.slug = slugify(value);
        return next;
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    const payload = {
      nev: form.nev || null,
      slug: form.slug || slugify(form.nev || ""),
      szulo: form.szulo ?? null,
      leiras_fent: form.leiras_fent || null,
      leiras_lent: form.leiras_lent || null,
      kep: selectedImage || null,
      kep_alt: form.kep_alt || null,
      kozzeteve: !!published,
    };

    if (!payload.nev || !payload.slug) {
      toast("Adj meg nevet (és slugot)!");
      return;
    }

    const { error } = await supabase
      .from("product-categories")
      .insert([payload])
      .select()
      .single();

    if (error) {
      toast("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:categories:changed"));
    toast.success("Kategória létrehozva!");
    handleClose();
    router.refresh();
  };

  return (
    <>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(img) => {
          setSelectedImage(img);
          setForm((prev) => ({ ...prev, kep: img }));
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="sticky top-0 bg-[#f5f5f5] flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[var(--border)] z-10">
          <div className="flex flex-nowrap gap-2">
            <button
              className="flex justify-center items-start w-12 border-r border-[var(--border)] p-2 hover:bg-[var(--border)]"
              onClick={handleClose}
            >
              <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
            </button>
            <div className="flex lg:flex-row flex-col gap-1 items-center">
              <h1 className="text-xl font-bold p-2">Új kategória</h1>
            </div>
          </div>
        </div>

        {/* törzs */}
        <div className="flex flex-col lg:p-6 p-3">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Kép */}
            <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
              <div
                className="relative cursor-pointer group"
                onClick={() => setMediaModalOpen(true)}
              >
                <Image
                  src={selectedImage || "/default.png"}
                  width={500}
                  height={500}
                  alt={form.kep_alt || "kategoria-kep"}
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
            <div className="space-y-2 w-full md:w-1/2">
              <div className="flex gap-2 items-start mb-2">
                <TbAlignJustified className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Alapadatok</H3>
              </div>

              <SmallTextInput legend="Név" name="nev" value={form.nev} handleChange={handleChange} />
              <SmallTextInput legend="Slug" name="slug" value={form.slug} handleChange={handleChange} />

              <CategorySelectInput
                label="Szülőkategória"
                value={form.szulo ?? null}
                onChange={(parentId) => setForm((prev) => ({ ...prev, szulo: parentId }))}
              />

              <Textarea legend="Felső leírás" name="leiras_fent" value={form.leiras_fent} rows={4} handleChange={handleChange} />
              <Textarea legend="Alsó leírás" name="leiras_lent" value={form.leiras_lent} rows={8} handleChange={handleChange} />
            </div>
          </div>
        </div>

        {/* lábléc */}
        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} />
          <div className="flex gap-2">
            <AdminCancelButton title="Mégse" onclick={handleClose} />
            <AdminSaveButton title="Mentés" onclick={handleSave} />
          </div>
        </div>
      </div>
    </>
  );
}