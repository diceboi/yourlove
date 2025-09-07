"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import BlogTextEditor from "@/app/components/UI/Inputfield/BlogTextEditor";
import { createClient } from "@/utils/supabase/client";

export default function AdminBlogEdit({ blog }) {
  const router = useRouter();
  if (!blog) return <div className="p-6">Betöltés...</div>;

  const [published, setPublished] = useState(!!blog.kozzeteve);
  const [form, setForm] = useState({
    ...blog,
    // biztos ami biztos: ha nincs, legyen üres string
    bevezeto: blog.bevezeto || "",
    tartalom: blog.tartalom || "",
  });

  // --- MediaLibraryModal mint image picker a szerkesztőhöz ---
  const [mediaOpen, setMediaOpen] = useState(false);
  const resolverRef = useRef(null); // ide tesszük a Promise.resolve-ot

  const pickImageFromLibrary = () =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setMediaOpen(true);
    });

  const handlePick = (url) => {
    if (resolverRef.current) {
      resolverRef.current(url || null);
      resolverRef.current = null;
    }
    setMediaOpen(false);
  };

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

    let q = supabase.from("blogs").update(payload);
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else q = q.eq("slug", form.slug);

    const { error } = await q.select().maybeSingle();

    if (error) {
      toast("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:blogs:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  const handleClose = () => router.back();

  return (
    <>
      {/* Media modal a képválasztáshoz (szövegbe illesztés) */}
      {mediaOpen && (
        <MediaLibraryModal
          isOpen={mediaOpen}
          onClose={() => handlePick(null)}
          onSelect={(imgUrl) => handlePick(imgUrl)}
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="sticky top-0 bg-[#f5f5f5] flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[var(--border)] z-10">
          <div className="flex flex-nowrap gap-2 items-center p-2">
            <h1 className="text-xl font-bold">{form.cim || ""}</h1>
            <span className="text-sm text-gray-500">ID: {form.id}</span>
          </div>
        </div>

        <div className="flex flex-col lg:p-6 p-3 min-h-[100vh] gap-8">
          {/* Alapadatok */}
          <div className="space-y-2 w-full">
            <SmallTextInput legend="Cím" name="cim" value={form.cim || ""} handleChange={handleChange} />
            <SmallTextInput legend="Slug" name="slug" value={form.slug || ""} handleChange={handleChange} />
            <Textarea legend="Bevezető" name="bevezeto" value={form.bevezeto || ""} rows={4} handleChange={handleChange} />
          </div>

          {/* Tartalom (TipTap) */}
          {/* Tartalom (TipTap) – zöld keret + cím, mint a többi mezőnél */}
          <div className="space-y-2">
            <BlogTextEditor
              titleLabel="Tartalom (blog)"
              value={form.tartalom || ""}
              onChange={(html) => setForm((prev) => ({ ...prev, tartalom: html }))}
              onPickImage={pickImageFromLibrary}  // MediaLibraryModal integráció
            />
          </div>
        </div>

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
