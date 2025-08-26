"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { TbClick, TbAlignJustified, TbPackage, TbListSearch, TbSeo, TbChevronLeft, TbShoppingBag } from "react-icons/tb";
import Modal from "@/app/components/UI/Modal";
import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import CategorySelectInput from "@/app/components/UI/Inputfield/CategorySelectInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import { createClient } from "@/utils/supabase/client";

export default function AdminProductCategoriesEdit({ category }) {
  const router = useRouter();

  // ha még nincs adat, ne próbáljuk olvasni
  if (!category) {
    return (
      <div className="p-6">
        <p>Betöltés...</p>
      </div>
    );
  }

  const [published, setPublished] = useState(!!category.kozzeteve);
  const [form, setForm] = useState({ ...category });
  const [selectedImage, setSelectedImage] = useState(category.kep || "");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    // ha van id, arra szűr; ha nincs, de van slug, akkor slug-ra
    const query = supabase.from("product-categories").update({
      ...form,
      kozzeteve: published,
      kep: selectedImage,
    });

    const filter = form.id != null && form.id !== ""
      ? query.eq("id", Number(form.id))
      : query.eq("slug", form.slug);

    const { data, error } = await filter.select().maybeSingle();

    if (error) {
      console.error("Mentési hiba:", error);
      toast("Hiba történt a mentés során.");
      return;
    }
    toast.success("Sikeres mentés!");
    router.back();
  };

  const handleClose = () => router.back();

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
        <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-1 border-b border-[var(--border)]">
          <div className="flex flex-col md:flex-row justify-between md:items-center items-start w-full gap-2">
            <div className="flex flex-nowrap gap-2">
              <button
                className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
                onClick={handleClose}
              >
                <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
              </button>
              <h1 className="text-xl font-bold w-full p-2 ">
                {form?.nev || ""}
              </h1>
            </div>
          </div>
        </div>

        {/* Kép */}
        <div className="flex flex-col lg:p-6 p-3 pb-">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
            <div className="relative cursor-pointer group" onClick={() => setMediaModalOpen(true)}>
              <Image
                src={selectedImage || "/default.png"}
                width={500}
                height={500}
                alt={form?.kep_alt || "termek-kep"}
                className="rounded-lg w-full h-auto group-hover:opacity-70"
              />
              <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                Kép módosítása
              </span>
            </div>
            <SmallTextInput legend="Kép alt" name="kep_alt" value={form?.kep_alt || ""} handleChange={handleChange} />
          </div>

          <div className="space-y-2 w-full md:w-1/2">
            <SmallTextInput legend="Név" name="nev" value={form?.nev || ""} handleChange={handleChange} />
            <SmallTextInput legend="Slug" name="slug" value={form?.slug || ""} handleChange={handleChange} />
            <CategorySelectInput
              label="Szülőkategória"
              value={form?.szulo ?? null}                // parent id vagy null
              onChange={(parentId) => {
                setForm(prev => ({ ...prev, szulo: parentId })); // ← CSAK az ID-t tároljuk
              }}
            />
            <Textarea legend="Felső leírás" name="leiras_fent" value={form?.leiras_fent || ""} rows={4} handleChange={handleChange} />
            <Textarea legend="Alsó leírás" name="leiras_lent" value={form?.leiras_lent || ""} rows={10} handleChange={handleChange} />
          </div> 
        </div>        
        </div>
        {/* footer */}
        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} />
          <div className="flex flex-row gap-2">
            <AdminCancelButton title="Mégse" onclick={handleClose} />
            <AdminSaveButton title="Mentés" onclick={handleSave} />
          </div>
        </div>
      </div>
    </>
  );
}
