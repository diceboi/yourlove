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
import { createClient } from "@/utils/supabase/client";

export default function AdminBlogEdit({ blog }) {
  const router = useRouter();
  if (!blog) return <div className="p-6">Betöltés...</div>;

  const [published, setPublished] = useState(!!blog.kozzeteve);
  const [form, setForm] = useState({
    ...blog,
    bevezeto: blog.bevezeto || "",
    tartalom: blog.tartalom || "",
    kep_alt: blog.kep_alt || "",
  });

  // fő kép kijelölve
  const [selectedImage, setSelectedImage] = useState(blog.kep || "");

  // egy közös Media modal mindkét esetre (főkép / inline)
  const [mediaOpen, setMediaOpen] = useState(false);
  const pickerModeRef = useRef(null); // 'cover' | 'inline' | null
  const resolverRef = useRef(null);   // Promise.resolve az inline-hoz

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

    // fallback
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
      kep: selectedImage || null,
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
          <div className="flex flex-nowrap gap-2 items-center p-2">
            <h1 className="text-xl font-bold">{form.cim || ""}</h1>
            <span className="text-sm text-gray-500">ID: {form.id}</span>
          </div>
        </div>

        <div className="flex flex-col lg:p-6 p-3 min-h-[100vh] gap-8">
          {/* Főkép */}
          <div className="relative space-y-4 md:w-1/2 overflow-hidden rounded-lg">
            <div
              className="relative cursor-pointer group"
              onClick={openCoverPicker}
            >
              <Image
                src={selectedImage || "/default.png"}
                width={500}
                height={500}
                alt={form.kep_alt || "blog-kep"}
                className="rounded-lg w-full h-auto group-hover:opacity-70"
              />
              <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                Kép módosítása
              </span>
            </div>
            <SmallTextInput
              legend="Kép alt"
              name="kep_alt"
              value={form.kep_alt || ""}
              handleChange={handleChange}
            />
          </div>

          {/* Alapadatok */}
          <div className="space-y-2 w-full">
            <SmallTextInput
              legend="Cím"
              name="cim"
              value={form.cim || ""}
              handleChange={handleChange}
            />
            <SmallTextInput
              legend="Slug"
              name="slug"
              value={form.slug || ""}
              handleChange={handleChange}
            />
            <Textarea
              legend="Bevezető"
              name="bevezeto"
              value={form.bevezeto || ""}
              rows={4}
              handleChange={handleChange}
            />
          </div>

          {/* Tartalom (TipTap) */}
          <div className="space-y-2">
            <BlogTextEditor
              legend="Tartalom (blog)"
              value={form.tartalom || ""}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, tartalom: html }))
              }
              onPickImage={pickImageFromLibrary} // inline kép a modalból
            />
          </div>
        </div>

        {/* Lábléc */}
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