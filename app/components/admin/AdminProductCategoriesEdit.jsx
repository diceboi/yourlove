"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { TbChevronLeft, TbAlignJustified, TbSeo } from "react-icons/tb";
import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import AdminDeleteButton from "@/app/components/UI/Buttons/AdminDeleteButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import CategorySelectInput from "@/app/components/UI/Inputfield/CategorySelectInput";
import IconsModalLibrary from "@/app/components/admin/IconsModalLibrary"; // ⬅️ ikon picker
import { createClient } from "@/utils/supabase/client";

export default function AdminProductCategoriesEdit({ category }) {
  const router = useRouter();
  if (!category) return <div className="p-6">Betöltés...</div>;

  const [published, setPublished] = useState(!!category.kozzeteve);
  const [form, setForm] = useState({ ...category });
  const [selectedImage, setSelectedImage] = useState(category.kep || "");
  const [selectedIcon, setSelectedIcon] = useState(category.icon || ""); // ⬅️ ÚJ
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [iconModalOpen, setIconModalOpen] = useState(false);            // ⬅️ ÚJ

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    const payload = {
      ...form,
      kozzeteve: !!published,
      kep: selectedImage || null,
      icon: selectedIcon || form.icon || null, // ⬅️ ikon külön oszlopba
    };

    let q = supabase.from("product-categories").update(payload);
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else q = q.eq("slug", form.slug);

    const { error } = await q.select().maybeSingle();
    if (error) {
      console.error(error);
      toast("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:categories:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  const handleDelete = async () => {
    const supabase = createClient();
    let q = supabase.from("product-categories").delete();
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else if (form.slug) q = q.eq("slug", form.slug);
    else {
      toast("Hiba: nincs megadva törölhető azonosító.");
      return;
    }
    const { error } = await q;
    if (error) {
      console.error("Törlési hiba:", error);
      toast("Hiba történt a törlés során.");
      return;
    }
    window.dispatchEvent(new CustomEvent("admin:categories:changed"));
    toast.success("Kategória törölve.");
    router.back();
    router.refresh();
  };

  const handleClose = () => router.back();

  return (
    <>
      {/* Képek a storage-ból (termékkategória borító) */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(img) => {
          setSelectedImage(img);
          setForm((prev) => ({ ...prev, kep: img }));
        }}
      />

      {/* Ikonok a storage icons/ könyvtárából */}
      <IconsModalLibrary
        isOpen={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        onSelect={(iconUrl) => {
          setSelectedIcon(iconUrl);
          setForm((prev) => ({ ...prev, icon: iconUrl }));
        }}
        allowUpload={true}
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
              <h1 className="text-xl font-bold p-2">{form.nev || ""}</h1>
              <Paragraph classname="min-w-fit">ID: {form.id}</Paragraph>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:p-6 p-3">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Kép blokk */}
            <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
              <div className="relative cursor-pointer group" onClick={() => setMediaModalOpen(true)}>
                <Image
                  src={selectedImage || "/default.png"}
                  width={500}
                  height={500}
                  alt={form.kep_alt || "kategoria-kep"}
                  className="rounded-lg w-full h-auto group-hover:opacity-70"
                />
                <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                  Kép módosítása
                </span>
              </div>

              {/* Ikon blokk – külön a képtől */}
                <div className="mb-2 font-semibold">Ikon</div>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 border border-[var(--border)] rounded-md bg-white">
                    {selectedIcon ? (
                      <Image src={selectedIcon} alt="ikon" fill className="object-contain p-2" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                        Nincs ikon
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIconModalOpen(true)}
                    className="border border-[var(--border)] rounded-lg px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    Ikon kiválasztása (Storage /icons)
                  </button>
                </div>
                {/* manuális szerkesztés, ha akarod kézzel beírni az URL-t */}
            </div>

            {/* Alapadatok */}
            <div className="space-y-2 w-full md:w-1/2">
              <div className="flex gap-2 items-start mb-2">
                <TbAlignJustified className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Alapadatok</H3>
              </div>

              <SmallTextInput legend="Név" name="nev" value={form.nev || ""} handleChange={handleChange} />

              <CategorySelectInput
                label="Szülőkategória"
                value={form.szulo ?? null}
                onChange={(parentId) => setForm((prev) => ({ ...prev, szulo: parentId }))}
                from={"product-categories"}
              />

              <Textarea legend="Felső leírás" name="leiras_fent" value={form.leiras_fent || ""} rows={4} handleChange={handleChange} />
              <Textarea legend="Alsó leírás" name="leiras_lent" value={form.leiras_lent || ""} rows={8} handleChange={handleChange} />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col lg:gap-8 gap-2 py-16">
            <div className="space-y-2 w-full">
              <div className="flex flex-nowrap gap-2 items-start mb-4">
                <TbSeo className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>SEO</H3>
              </div>
            {/* SEO Építő – ez automatikusan frissíti a form.seo_title-t */}
            <SmallTextInput legend="Kép alt" name="kep_alt" value={form.kep_alt || ""} handleChange={handleChange} />
            <SmallTextInput legend="Meta title" name="meta_title" value={form.meta_title || ""} handleChange={handleChange} />
            <SmallTextInput legend="Slug" name="slug" value={form.slug || ""} handleChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} />
          <div className="flex gap-2">
            <AdminCancelButton title="Mégse" onclick={handleClose} buttonicon={"TbX"} />
            <AdminDeleteButton title="Törlés" onconfirm={handleDelete} buttonicon="TbTrash" />
            <AdminSaveButton title="Mentés" onclick={handleSave} buttonicon={"TbDeviceFloppy"} />
          </div>
        </div>
      </div>
    </>
  );
}
