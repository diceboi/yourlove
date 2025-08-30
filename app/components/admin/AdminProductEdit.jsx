"use client";

import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect";
import { toast } from "react-toastify";
import Image from "next/image";
import { TbAlignJustified, TbClick, TbChevronLeft, TbSeo } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import { createClient } from "@/utils/supabase/client";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";

export default function AdminProductEdit({ product }) {
  const router = useRouter();

  const [published, setPublished] = useState(!!product.kozzeteve);
  const [form, setForm] = useState({
    ...product,
    kategoriak_paths: (() => {
      try {
        const v = product.kategoria;
        if (typeof v === "string" && v.trim()) return JSON.parse(v);
      } catch {}
      return [];
    })(),
  });
  const [selectedImage, setSelectedImage] = useState(product.termekkep || "");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    const paths = Array.isArray(form.kategoriak_paths)
      ? form.kategoriak_paths
          .map((p) =>
            Array.isArray(p) ? p.map((n) => Number(n)).filter(Number.isFinite) : []
          )
          .filter((p) => p.length > 0)
      : [];

    const { id, created_at, updated_at, kategoriak_paths, ...rest } = form || {};

    const payload = {
      ...rest,
      kozzeteve: !!published,
      termekkep: selectedImage || null,
      kategoria: JSON.stringify(paths),
    };

    const idStr = String(form.id || "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(idStr)) {
      toast("Hiba: érvénytelen termék ID.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", idStr)
      .select()
      .single();

    if (error) {
      toast("Hiba történt a mentés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:products:changed"));
    toast.success("Sikeres mentés!");
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
          setForm((prev) => ({ ...prev, termekkep: img }));
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="sticky top-0 bg-[#f5f5f5] flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[var(--border)]">
          <div className="flex flex-col md:flex-row justify-between md:items-center items-start w-full gap-2">
            <div className="flex flex-nowrap gap-2">
              <button
                className="flex justify-center items-start w-12 border-r border-[var(--border)] p-2 hover:bg-[var(--border)]"
                onClick={handleClose}
              >
                <TbChevronLeft className="text-[var(--pink)] w-8" />
              </button>
              <div className="flex lg:flex-row flex-col gap-1 items-center">
                <h1 className="text-xl font-bold p-2">{form.seo_title || ""}</h1>
                <Paragraph classname={"min-w-fit"}>ID: {form.id || ""}</Paragraph>
              </div>
            </div>

            <div className="md:flex gap-1 w-fit hidden pr-2">
              <TbClick className="text-[var(--pink)]" />
              <Paragraph>Kattintások: </Paragraph>
              <Paragraph classname={"text-[var(--pink)]"}>
                {form.kattintasok || ""}
              </Paragraph>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:p-6 p-3">
          <div className="flex flex-col md:flex-row gap-8 pb-16">
            <div className="relative md:w-1/2 overflow-hidden rounded-lg">
              <div className="relative cursor-pointer group" onClick={() => setMediaModalOpen(true)}>
                <Image
                  src={selectedImage || "/default.png"}
                  width={500}
                  height={500}
                  alt={product.seo_slug || "termek-kep"}
                  className="rounded-lg w-full h-auto group-hover:opacity-70"
                />
                <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                  Kép módosítása
                </span>
              </div>
            </div>

            <div className="space-y-2 w-full md:w-1/2">
              <div className="flex gap-2 items-start mb-4">
                <TbAlignJustified className="min-w-8 bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Általános</H3>
              </div>

              <SmallTextInput legend="Főcím" name="fo_cim" value={form.fo_cim || ""} handleChange={handleChange} />
              <SmallTextInput legend="Alcím" name="alcim" value={form.alcim || ""} handleChange={handleChange} />
              <SmallTextInput legend="Cikkszám" name="cikkszam" value={form.cikkszam || ""} handleChange={handleChange} />
              <SmallTextInput legend="Vonalkód" name="vonalkod" value={form.vonalkod || ""} handleChange={handleChange} />
              <SmallTextInput legend="Gyártó" name="gyarto" value={form.gyarto || ""} handleChange={handleChange} />
              <SmallTextInput legend="Brand logó" name="brand_logo" value={form.brand_logo || ""} handleChange={handleChange} />
              <SmallTextInput legend="Címkék" name="cimkek" value={form.cimkek || ""} handleChange={handleChange} />

              <CategoryPathMultiSelect
                label="Kategóriák"
                value={form.kategoriak_paths}
                onChange={(paths) => setForm((prev) => ({ ...prev, kategoriak_paths: paths }))}
              />
            </div>
          </div>

          <Textarea
            legend="Termékleírás"
            name="termekleiras"
            value={form.termekleiras || ""}
            handleChange={handleChange}
            rows={10}
          />

          {/* SEO */}
          <div className="flex lg:flex-row flex-col lg:gap-8 gap-2 pt-8">
            <div className="space-y-2 w-full">
              <div className="flex gap-2 items-start mb-4">
                <TbSeo className="min-w-8 bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>SEO</H3>
              </div>
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={form.og_image || "/default.png"}
                  width={300}
                  height={300}
                  alt={form.seo_slug || "termek-kep"}
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </div>
            <div className="space-y-2 w-full mt-0 lg:mt-12">
              <SmallTextInput legend="SEO Cím" name="seo_title" value={form.seo_title || ""} handleChange={handleChange} />
              <SmallTextInput legend="SEO Slug" name="seo_slug" value={form.seo_slug || ""} handleChange={handleChange} />
              <Textarea legend="Meta leírás" name="meta_leiras" value={form.meta_leiras || ""} handleChange={handleChange} rows={4} />
              <SmallTextInput legend="OG Cím" name="og_title" value={form.og_title || ""} handleChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} />
          <div className="flex flex-row gap-2">
            <AdminCancelButton title="Mégse" link="" onclick={handleClose} buttonicon="" />
            <AdminSaveButton title="Mentés" link="" onclick={handleSave} buttonicon="" />
          </div>
        </div>
      </div>
    </>
  );
}
