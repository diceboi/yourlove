"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { TbChevronLeft, TbAlignJustified } from "react-icons/tb";
import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import AdminDeleteButton from "@/app/components/UI/Buttons/AdminDeleteButton"; // ⬅️ ÚJ
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import { createClient } from "@/utils/supabase/client";

export default function AdminBlogTagsEdit({ tags }) {
  const router = useRouter();
  if (!tags) return <div className="p-6">Betöltés...</div>;

  const [published, setPublished] = useState(!!tags.kozzeteve);
  const [form, setForm] = useState({ ...tags });
  const [selectedImage, setSelectedImage] = useState(tags.kep || "");
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
    };

    let q = supabase.from("blog-tags").update(payload);
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else q = q.eq("slug", form.slug);

    const { error } = await q.select().maybeSingle();

    if (error) {
      console.error("Mentési hiba:", error);
      toast("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:tags:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  // ⬇️ TÖRLÉS
  const handleDelete = async () => {
    const supabase = createClient();

    let q = supabase.from("blog-tags").delete();
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

    window.dispatchEvent(new CustomEvent("admin:tags:changed"));
    toast.success("Címke törölve.");
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

        <div className="flex flex-col lg:p-6 p-3 min-h-[100vh]">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Alapadatok */}
            <div className="space-y-2 w-full">
              <div className="flex gap-2 items-start mb-2">
                <TbAlignJustified className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Alapadatok</H3>
              </div>

              <SmallTextInput legend="Név" name="nev" value={form.nev || ""} handleChange={handleChange} />
              <SmallTextInput legend="Slug" name="slug" value={form.slug || ""} handleChange={handleChange} />
              <Textarea legend="Leírás" name="leiras" value={form.leiras || ""} rows={4} handleChange={handleChange} />
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
