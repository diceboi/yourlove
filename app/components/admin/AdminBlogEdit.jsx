"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import AdminDeleteButton from "@/app/components/UI/Buttons/AdminDeleteButton";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";
import BlogTextEditor from "@/app/components/UI/Inputfield/BlogTextEditor";
import TagsMultiSelect from "@/app/components/UI/Inputfield/TagsMultiSelect";
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect";
import { createClient } from "@/utils/supabase/client";

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

/**
 * A CategoryPathMultiSelect a termékeknél path-tömböket vár (pl. [[1,2],[3,9]]).
 * Blognál is ezt adjuk neki (DB-ben: TEXT/JSON a 'kategoriak' oszlopban).
 */
function toPathArray(v) {
  try {
    if (Array.isArray(v)) {
      // már path-tömb
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

export default function AdminBlogEdit({ blog }) {
  const router = useRouter();
  if (!blog) return <div className="p-6">Betöltés...</div>;

  // ---- Kezdeti state normalizálás
  const initialPaths = useMemo(() => {
    // ha a blogs táblában 'kategoriak' TEXT/JSON oszlop van:
    // (ha nálad a neve más – pl. 'kategoriak_paths' vagy 'blog_kategoriak' – itt írd át)
    return toPathArray(blog.kategoria || blog.kategoriak_paths || []);
  }, [blog]);

  const initialTags = useMemo(() => {
    // ha a blogs táblában a cimkék TEXT/JSON oszlop (pl. "[1,2,3]"):
    return toIdArray(blog.cimke);
  }, [blog]);

  const [published, setPublished] = useState(!!blog.kozzeteve);
  const [form, setForm] = useState({
    ...blog,
    bevezeto: blog.bevezeto || "",
    tartalom: blog.tartalom || "",
    kep_alt: blog.kep_alt || "",
    // UI-only mezők a komponensekhez:
    kategoriak_paths: initialPaths,  // [[...], [...]]
    cimkek: initialTags,             // [id, id, ...]
  });

  const [selectedImage, setSelectedImage] = useState(blog.kep || "");
  const [mediaOpen, setMediaOpen] = useState(false);
  const pickerModeRef = useRef(null);
  const resolverRef = useRef(null);

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

    setMediaOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const supabase = createClient();

    // 1) Path-ok normalizálása → JSON string a DB-nek
    const normalizedPaths = Array.isArray(form.kategoriak_paths)
      ? form.kategoriak_paths
          .map((p) =>
            Array.isArray(p)
              ? p.map((n) => Number(n)).filter(Number.isFinite)
              : []
          )
          .filter((p) => p.length > 0)
      : [];

    // 2) Cimkék normalizálása (egyszerű id tömb) → JSON string
    const tagIds = Array.isArray(form.cimkek)
      ? Array.from(new Set(form.cimkek.map(Number).filter(Number.isFinite)))
      : [];

    // 3) payload: UI-only mezőket NE küldjük fel
    const {
      id,
      created_at,
      updated_at,
      kategoriak_paths, // UI-only
      cimkek: _uiTags,  // UI-only
      ...rest
    } = form || {};

    const payload = {
      ...rest,
      kozzeteve: !!published,
      kep: selectedImage || null,
      kategoria: JSON.stringify(normalizedPaths),
      cimke: JSON.stringify(tagIds),
    };

    let q = supabase.from("blogs").update(payload);
    if (form.id != null && form.id !== "") q = q.eq("id", Number(form.id));
    else q = q.eq("slug", form.slug);

    const { error } = await q.select().maybeSingle();
    if (error) {
      console.error("Mentési hiba:", error);
      toast("Hiba történt a mentés során.");
      return;
    }

    setForm(prev => ({
      ...prev,
      kategoriak_paths: normalizedPaths,
      cimkek: tagIds,
    }));
    
    window.dispatchEvent(new CustomEvent("admin:blogs:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  const handleDelete = async () => {
    const supabase = createClient();

    let q = supabase.from("blogs").delete();
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

    window.dispatchEvent(new CustomEvent("admin:blogs:changed"));
    toast.success("Bejegyzés törölve.");
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
            <div className="relative cursor-pointer group" onClick={openCoverPicker}>
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
            <SmallTextInput legend="Cím" name="cim" value={form.cim || ""} handleChange={handleChange} />
            <SmallTextInput legend="Slug" name="slug" value={form.slug || ""} handleChange={handleChange} />
            <Textarea legend="Bevezető" name="bevezeto" value={form.bevezeto || ""} rows={4} handleChange={handleChange} />

            {/* BLOG cimkék */}
            <TagsMultiSelect
              value={form.cimkek || []}                 // [id, id, ...]
              onChange={(ids) => setForm((p) => ({ ...p, cimkek: ids }))}
              // ha a komponens tud forrást váltani: source="blog"
            />

            {/* BLOG kategóriák (path-alapú kiválasztó) */}
            <CategoryPathMultiSelect
              label="Kategóriák (blog)"
              value={form.kategoriak_paths || []}
              onChange={(paths) =>
                setForm((prev) => ({ ...prev, kategoriak_paths: paths }))
              }
              // ha a komponens tud forrást váltani: table="blog-categories"
            />
          </div>

          {/* Tartalom (TipTap) */}
          <div className="space-y-2">
            <BlogTextEditor
              legend="Tartalom (blog)"
              value={form.tartalom || ""}
              onChange={(html) => setForm((prev) => ({ ...prev, tartalom: html }))}
              onPickImage={pickImageFromLibrary}
            />
          </div>
        </div>

        {/* Lábléc */}
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
