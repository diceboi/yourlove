"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { TbChevronLeft, TbSeo, TbAlignJustified } from "react-icons/tb";
import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import AdminDeleteButton from "@/app/components/UI/Buttons/AdminDeleteButton"; // ⬅️ ÚJ
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import CategorySelectInput from "@/app/components/UI/Inputfield/CategorySelectInput";
import { createClient } from "@/utils/supabase/client";

export default function AdminBlogCategoriesEdit({ category }) {
  const router = useRouter();
  if (!category) return <div className="p-6">Betöltés...</div>;

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

    const payload = {
      ...form,
      kozzeteve: !!published,
      kep: selectedImage || null,
    };

    let q = supabase.from("blog-categories").update(payload);
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else q = q.eq("slug", form.slug);

    const { error } = await q.select().maybeSingle();

    if (error) {
      toast("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:categories:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  // ⬇️ TÖRLÉS
  const handleDelete = async () => {
    const supabase = createClient();

    let q = supabase.from("blog-categories").delete();
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else if (form.slug) q = q.eq("slug", form.slug);
    else {
      toast("Hiba: nincs megadva törölhető azonosító.");
      return;
    }

    const { error } = await q;

    if (error) {
      console.error("Törlési hiba:", error);
      // Itt lehet finomítani FK ütközésre (pl. 23503) ha szükséges
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
              <h1 className="text-xl font-bold p-2">{form.nev || ""}</h1>
              <Paragraph classname="min-w-fit">ID: {form.id}</Paragraph>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:p-6 p-3">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Kép */}
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
                from={"blog-categories"}
              />

              <Textarea legend="Felső leírás" name="leiras_fent" value={form.leiras_fent || ""} rows={4} handleChange={handleChange} />
              <Textarea legend="Alsó leírás" name="leiras_lent" value={form.leiras_lent || ""} rows={8} handleChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2 w-full mt-12">
            <div className="flex flex-nowrap gap-2 items-start mb-4">
              <TbSeo className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
              <H3>SEO</H3>
            </div>
            <div className="space-y-2 w-full">
            {/* SEO Építő – ez automatikusan frissíti a form.seo_title-t */}
            <SmallTextInput
              legend={"Meta title"}
              handleChange={handleChange}
              name="meta_title"
              value={form.meta_title || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Slug"}
              handleChange={handleChange}
              name="slug"
              value={form.slug || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Főkép alt"}
              handleChange={handleChange}
              name="kep_alt"
              value={form.kep_alt || ""}
              placeholder=""
              classname={""}
            />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} />
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
