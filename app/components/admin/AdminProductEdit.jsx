"use client";

import H2 from "@/app/components/UI/Texts/H2";
import H3 from "@/app/components/UI/Texts/H3";
import H4 from "@/app/components/UI/Texts/H4";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import SeoTitleBuilder from "@/app/components/UI/Inputfield/SeoTitleBuilder";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect";
import TagsMultiSelect from "@/app/components/UI/Inputfield/TagsMultiSelect";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  TbClick,
  TbBarcode,
  TbIdBadge2,
  TbShoppingBag,
  TbAlignJustified,
  TbPackage,
  TbListSearch,
  TbSeo,
  TbChevronLeft,
  TbPhotoPlus
} from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import Label from "@/app/components/UI/Texts/Label";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import AdminDeleteButton from "@/app/components/UI/Buttons/AdminDeleteButton";
import PinkButton from "../UI/Buttons/PinkButton";
import { createClient } from "@/utils/supabase/client";
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal";

export default function AdminProductEdit({ product }) {
  const router = useRouter();

  const [published, setPublished] = useState(product.kozzeteve === true);
  
  const toIdArray = (v) => {
    try {
      if (Array.isArray(v)) return v.map(Number).filter(Number.isFinite);
      if (typeof v === "string" && v.trim()) {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isFinite);
      }
    } catch {}
    return [];
  };

  const [form, setForm] = useState({
    ...product,
    kategoriak_paths: (() => {
      try {
        const v = product.kategoria;
        if (typeof v === "string" && v.trim()) {
          return JSON.parse(v); // elvárjuk: [[1,2],[3,7]]
        }
      } catch {}
      return [];
    })(),
    cimkek: toIdArray(product.cimkek),
  });
  const [selectedImage, setSelectedImage] = useState(product.termekkep || "");
  const [selectedOGImage, setSelectedOGImage] = useState(product.og_image || "")
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [gallery, setGallery] = useState(() => {
  const raw = product.kepgaleria || "";
    return raw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
  });

  const pickerModeRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  {
    /*MENTÉS GOMB LOGIKA*/
  }

  const handleSave = async () => {
    const supabase = createClient();

    // kategória path-ok normalizálása
    const paths = Array.isArray(form.kategoriak_paths)
      ? form.kategoriak_paths
          .map((p) =>
            Array.isArray(p)
              ? p.map((n) => Number(n)).filter(Number.isFinite)
              : []
          )
          .filter((p) => p.length > 0)
      : [];

    // --- canonical_path + primary_category_id előállítás ---
    let canonical_path = null
    let primary_category_id = null

    if (paths.length > 0) {
      // 1) Válassz kanonikus pathot (most: az első)
      const canonicalIds = paths[0] // pl. [2, 11]
      primary_category_id = canonicalIds[canonicalIds.length - 1] ?? null

      // 2) Csak a szükséges kategória ID-k slugjai kellenek
      const idsToFetch = Array.from(new Set(canonicalIds))

      const supabase = createClient()
      const { data: catRows, error: catErr } = await supabase
        .from("product-categories")
        .select("id, slug")
        .in("id", idsToFetch)

      if (!catErr && Array.isArray(catRows)) {
        const slugMap = Object.fromEntries(catRows.map(c => [String(c.id), c.slug]))
        const slugs = canonicalIds.map(id => slugMap[String(id)]).filter(Boolean)
        if (slugs.length === canonicalIds.length) {
          canonical_path = slugs.join("/")
        }
      }
    }

    const tagIds = Array.isArray(form.cimkek)
    ? Array.from(new Set(form.cimkek.map(Number).filter(Number.isFinite)))
    : [];  

    // payload – ne küldd fel a kliens-oldali state mezőket
    const {
      id, // <- ne rakjuk a payloadba
      created_at,
      updated_at,
      kategoriak_paths, // UI-only
      ...rest
    } = form || {};

    const payload = {
      ...rest,
      kozzeteve: !!published,
      termekkep: selectedImage || null,
      og_image: selectedOGImage || null,
      kategoria: JSON.stringify(paths),
      cimkek: JSON.stringify(tagIds),
      canonical_path,
      kepgaleria: (gallery || []).join(";"), // <-- ÚJ
    };

    const idStr = String(form.id || "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(idStr)) {
      console.error("Mentési hiba: érvénytelen ID", { id: form.id });
      toast("Hiba: érvénytelen termék ID.");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", idStr) // <-- NEM Number(), sima string UUID
      .select()
      .single();

    if (error) {
      console.error("Mentési hiba:", error);
      toast("Hiba történt a mentés során.");
      return;
    }

    // jelzés a listának + SSR frissítés, ha kell
    console.log('Dispatching admin:products:changed event');
    window.dispatchEvent(new CustomEvent("admin:products:changed"));
    toast.success("Sikeres mentés!");
    router.back();
    router.refresh();
  };

  const handleDelete = async () => {
    const supabase = createClient();
    const idStr = String(form.id || "").trim();

    // UUID ellenőrzés ugyanúgy, mint mentésnél
    if (!/^[0-9a-fA-F-]{36}$/.test(idStr)) {
      console.error("Törlési hiba: érvénytelen ID", { id: form.id });
      toast("Hiba: érvénytelen termék ID.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", idStr);

    if (error) {
      console.error("Törlési hiba:", error);
      toast("Hiba történt a törlés során.");
      return;
    }

    window.dispatchEvent(new CustomEvent("admin:products:changed"));
    toast.success("Termék törölve.");
    router.back();
    router.refresh();
  };


  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        multiple={pickerModeRef.current === "gallery" ? true : false}
        initialSelected={pickerModeRef.current === "gallery" ? gallery : []}
        onClose={() => {
          setMediaModalOpen(false);
          pickerModeRef.current = null;
        }}
        onSelect={(value) => {
          const mode = pickerModeRef.current;

          if (mode === "gallery") {
              const urls = Array.isArray(value) ? value : [value];
              setGallery(urls);
              setForm((f) => ({
                ...f,
                kepgaleria: urls.join(";"),
              }));
            return;
          } else if (mode === "og_image") {
            const url = Array.isArray(value) ? value[0] : value;
            setSelectedOGImage(url);
            setForm((prev) => ({ ...prev, og_image: url }));
          } else {
            const url = Array.isArray(value) ? value[0] : value;
            setSelectedImage(url);
            setForm((prev) => ({ ...prev, termekkep: url }));
          }
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
              <div className="flex lg:flex-row flex-col gap-1 items-center">
                <h1 className="text-xl font-bold w-full p-2 ">
                  {form.fo_cim || ""} {form.alcim || ""}
                </h1>
                <Paragraph classname={"min-w-fit"}>
                  ID: {form.id || ""}
                </Paragraph>
              </div>
            </div>

            <div className="md:flex flex-nowrap gap-1 w-fit hidden pr-2">
              <TbClick className="text-[var(--pink)]" />
              <Paragraph>Kattintások: </Paragraph>
              <Paragraph classname={"text-[var(--pink)]"}>
                {form.kattintasok || ""}
              </Paragraph>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:p-6 p-3">
          <div className="flex flex-nowrap gap-1 w-fit md:hidden -mt-6 pb-3">
            <TbClick className="text-[var(--pink)]" />
            <Paragraph>Kattintások: </Paragraph>
            <Paragraph classname={"text-[var(--pink)]"}>
              {form.kattintasok || ""}
            </Paragraph>
          </div>
          <div className="flex flex-col md:flex-row gap-8 pb-16">
            <div className="relative md:w-1/2 overflow-hidden rounded-lg">
              <div
                className="relative cursor-pointer group"
                onClick={() => {
                  pickerModeRef.current = "termekkep";
                  setMediaModalOpen(true);
                }}
              >
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
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label classname="font-bold text-xs">Termék galéria</Label>
                  
                </div>

                {gallery.length === 0 ? (
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 text-xs text-[var(--secondary-text)] px-2 py-1 border border-[var(--border)] rounded-md hover:bg-[var(--border)] h-20"
                    onClick={() => {
                      pickerModeRef.current = "gallery";
                      setMediaModalOpen(true);
                    }}
                  >
                    <TbPhotoPlus className="w-6 h-auto" />
                    Kép hozzáadása
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {gallery.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 border border-[var(--border)] rounded-md overflow-hidden group"
                      >
                        <Image
                          src={src}
                          alt={`Galéria kép ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-[var(--error)]/80 text-[10px] text-white px-1.25 py-0.5 m-1 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          onClick={() => {
                            setGallery((prev) => {
                              const next = prev.filter((_, i) => i !== idx);
                              setForm((f) => ({
                                ...f,
                                kepgaleria: next.join(";"),
                              }));
                              return next;
                            });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center gap-2 text-xs text-[var(--secondary-text)] px-2 py-1 border border-[var(--border)] rounded-md hover:bg-[var(--border)] h-20"
                      onClick={() => {
                        pickerModeRef.current = "gallery";
                        setMediaModalOpen(true);
                      }}
                    >
                      <TbPhotoPlus className="w-6 h-auto" />
                      Kép hozzáadása
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ÁLTALÁNOS */}
            <div className="space-y-2 w-full md:w-1/2">
              <div className="flex flex-nowrap gap-2 items-start mb-4">
                <TbAlignJustified className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Általános</H3>
              </div>
              <SmallTextInput
                legend={"Főcím"}
                handleChange={handleChange}
                name="fo_cim"
                value={form.fo_cim || ""}
                placeholder="Főcím"
                classname={""}
              />
              <SmallTextInput
                legend={"Alcím"}
                handleChange={handleChange}
                name="alcim"
                value={form.alcim || ""}
                placeholder="Alcím"
                classname={""}
              />
              <SmallTextInput
                legend={"Cikkszám"}
                handleChange={handleChange}
                name="cikkszam"
                value={form.cikkszam || ""}
                placeholder="Cikkszám"
                classname={""}
              />
              <SmallTextInput
                legend={"Vonalkód"}
                handleChange={handleChange}
                name="vonalkod"
                value={form.vonalkod || ""}
                placeholder="Vonalkód"
                classname={""}
              />
              <SmallTextInput
                legend={"Gyártó"}
                handleChange={handleChange}
                name="gyarto"
                value={form.gyarto || ""}
                placeholder="Gyártó"
                classname={""}
              />
              <SmallTextInput
                legend={"Brand logó"}
                handleChange={handleChange}
                name="brand_logo"
                value={form.brand_logo || ""}
                placeholder="Brand logó"
                classname={""}
              />
              <TagsMultiSelect
                value={form.cimkek || []}                 // ID-k tömbje
                onChange={(ids) => setForm((p) => ({ ...p, cimkek: ids }))}
                from={"product-tags"}
              />
              <CategoryPathMultiSelect
                label="Kategóriák"
                value={form.kategoriak_paths}
                onChange={(paths) =>
                  setForm((prev) => ({ ...prev, kategoriak_paths: paths }))
                }
                from={"product-categories"}
              />
            </div>
          </div>

          <Textarea
            legend={"Termékleírás"}
            handleChange={handleChange}
            name="termekleiras"
            value={form.termekleiras || ""}
            placeholder=""
            classname={""}
            rows={10}
          />

          {/* SZÁLLÍTÁS */}
          <div className="flex lg:flex-row flex-col lg:gap-8 gap-2 py-16">
            <div className="space-y-2 w-full">
              <div className="flex flex-nowrap gap-2 items-start mb-4">
                <TbShoppingBag className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Szállítás és rendelés</H3>
              </div>
              <SmallTextInput
                legend={"Beszerzési ár nettó"}
                handleChange={handleChange}
                name="beszerzesi_ar_netto"
                value={form.beszerzesi_ar_netto || ""}
                placeholder=""
                classname={""}
                after={"Ft"}
              />
              <SmallTextInput
                legend={"Beszerzési ár bruttó"}
                handleChange={handleChange}
                name="beszerzesi_ar_brutto"
                value={form.beszerzesi_ar_brutto || ""}
                placeholder=""
                classname={""}
                after={"Ft"}
              />
              <SmallTextInput
                legend={"Akció mértéke (%)"}
                handleChange={handleChange}
                name="akcio_szazalek"
                value={form.akcio_szazalek || ""}
                placeholder=""
                classname={""}
                after={"%"}
              />
              <SmallTextInput
                legend={"Akció mértéke (Ft)"}
                handleChange={handleChange}
                name="akcio_ar"
                value={form.akcio_ar || ""}
                placeholder=""
                classname={""}
                after={"Ft"}
              />
              <SmallTextInput
                legend={"Bruttó eladási ár"}
                handleChange={handleChange}
                name="eladasi_ar_brutto"
                value={form.eladasi_ar_brutto || ""}
                placeholder=""
                classname={""}
                after={"Ft"}
              />
              <SmallTextInput
                legend={"Akciós eladási ár"}
                handleChange={handleChange}
                name="akcios_ar_brutto"
                value={form.akcios_ar_brutto || ""}
                placeholder=""
                classname={""}
                after={"Ft"}
              />
              <SmallTextInput
                legend={"Súly"}
                handleChange={handleChange}
                name="suly"
                value={form.suly || ""}
                placeholder=""
                classname={""}
                after={"gr"}
              />
              <SmallTextInput
                legend={"Szállítási idő"}
                handleChange={handleChange}
                name="szallitasi_ido"
                value={form.szallitasi_ido || ""}
                placeholder=""
                classname={""}
              />
            </div>
            <div className="space-y-2 w-full mt-0 lg:mt-12">
              <Textarea
                legend={"Csomag tartalma"}
                handleChange={handleChange}
                name="csomag_tartalma"
                value={form.csomag_tartalma || ""}
                placeholder=""
                classname={""}
                rows={3}
              />
              <SmallTextInput
                legend={"Csomagolás"}
                handleChange={handleChange}
                name="csomagolas"
                value={form.csomagolas || ""}
                placeholder=""
                classname={""}
              />
              <SmallTextInput
                legend={"Szállító név"}
                handleChange={handleChange}
                name="szallito_nev"
                value={form.szallito_nev || ""}
                placeholder=""
                classname={""}
              />
              <SmallTextInput
                legend={"Garancia"}
                handleChange={handleChange}
                name="garancia"
                value={form.garancia || ""}
                placeholder=""
                classname={""}
                after={"év"}
              />
              <SmallTextInput
                legend={"Min. rendelés"}
                handleChange={handleChange}
                name="minimalis_rendeles"
                value={form.minimalis_rendeles || ""}
                placeholder=""
                classname={""}
                after={"db"}
              />
            </div>
          </div>

          {/* RAKTÁRKEZELÉS */}
          <div className="flex lg:flex-row flex-col lg:gap-8 gap-2 pb-16">
            <div className="space-y-2 w-full">
              <div className="flex flex-nowrap gap-2 items-start mb-4">
                <TbPackage className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Raktárkezelés</H3>
              </div>
              <SmallTextInput
                legend={"Készlet"}
                handleChange={handleChange}
                name="keszlet"
                value={form.keszlet || ""}
                placeholder=""
                classname={""}
                after={"db"}
              />
            </div>
            <div className="space-y-2 w-full mt-0 lg:mt-12">
              <SmallTextInput
                legend={"Polc"}
                handleChange={handleChange}
                name="polc"
                value={form.polc || ""}
                placeholder=""
                classname={""}
              />
            </div>
          </div>

          {/* RÉSZLETES TERMÉKADATOK */}
          <div className="flex flex-col gap-8 pb-16">
            <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
              <div className="space-y-2 w-full">
                <div className="flex flex-nowrap gap-2 items-start mb-4">
                  <TbListSearch className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                  <H3>Részletes termékadatok</H3>
                </div>
                <Paragraph classname={"text-[var(--pink)] font-bold"}>
                  Szín
                </Paragraph>
                <SmallTextInput
                  legend={"Szín"}
                  handleChange={handleChange}
                  name="szin"
                  value={form.szin || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Tok szín"}
                  handleChange={handleChange}
                  name="tok_szin"
                  value={form.tok_szin || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Betét szín"}
                  handleChange={handleChange}
                  name="betet_szin"
                  value={form.betet_szin || ""}
                  placeholder=""
                  classname={""}
                />
              </div>
              <div className="space-y-2 w-full mt-0 lg:mt-12">
                <Paragraph classname={"text-[var(--pink)] font-bold"}>
                  Anyag
                </Paragraph>
                <SmallTextInput
                  legend={"Anyag"}
                  handleChange={handleChange}
                  name="anyag"
                  value={form.anyag || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Külső anyag"}
                  handleChange={handleChange}
                  name="kulso_anyag"
                  value={form.kulso_anyag || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Belső anyag"}
                  handleChange={handleChange}
                  name="belso_anyag"
                  value={form.belso_anyag || ""}
                  placeholder=""
                  classname={""}
                />
              </div>
            </div>

            <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
              <div className="space-y-2 w-full">
                <Paragraph classname={"text-[var(--pink)] font-bold"}>
                  Dimenziók
                </Paragraph>
                <SmallTextInput
                  legend={"Méretek"}
                  handleChange={handleChange}
                  name="meretek"
                  value={form.meretek || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Hossz"}
                  handleChange={handleChange}
                  name="hossz"
                  value={form.hossz || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Szélesség"}
                  handleChange={handleChange}
                  name="szelesseg"
                  value={form.szelesseg || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Magasság"}
                  handleChange={handleChange}
                  name="magassag"
                  value={form.magassag || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Összes hossz"}
                  handleChange={handleChange}
                  name="osszes_hossz"
                  value={form.osszes_hossz || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Használható hossz"}
                  handleChange={handleChange}
                  name="hasznalhato_hossz"
                  value={form.hasznalhato_hossz || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Belső átmérő"}
                  handleChange={handleChange}
                  name="belso_atmero"
                  value={form.belso_atmero || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Külső átmérő"}
                  handleChange={handleChange}
                  name="kulso_atmero"
                  value={form.kulso_atmero || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
              </div>
              <div className="space-y-2 w-full mt-0 lg:mt-7">
                <SmallTextInput
                  legend={"Talp méret"}
                  handleChange={handleChange}
                  name="talp_meret"
                  value={form.talp_meret || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Felső átmérő"}
                  handleChange={handleChange}
                  name="felso_atmero"
                  value={form.felso_atmero || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Alsó átmérő"}
                  handleChange={handleChange}
                  name="also_atmero"
                  value={form.also_atmero || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Fejrész átmérő"}
                  handleChange={handleChange}
                  name="fejresz_atmero"
                  value={form.fejresz_atmero || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Távirányító mérete"}
                  handleChange={handleChange}
                  name="taviranyito_merete"
                  value={form.taviranyito_merete || ""}
                  placeholder=""
                  classname={""}
                  after={"mm"}
                />
                <SmallTextInput
                  legend={"Távirányító hatótáv"}
                  handleChange={handleChange}
                  name="taviranyito_hatotav"
                  value={form.taviranyito_hatotav || ""}
                  placeholder=""
                  classname={""}
                  after={"m"}
                />
                <SmallTextInput
                  legend={"Távirányító módok"}
                  handleChange={handleChange}
                  name="taviranyito_modok"
                  value={form.taviranyito_modok || ""}
                  placeholder=""
                  classname={""}
                />
              </div>
            </div>

            <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
              <div className="space-y-2 w-full">
                <Paragraph classname={"text-[var(--pink)] font-bold"}>
                  Funkciók
                </Paragraph>
                <SmallTextInput
                  legend={"Funkció"}
                  handleChange={handleChange}
                  name="funkcio"
                  value={form.funkcio || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Applikáció"}
                  handleChange={handleChange}
                  name="applikacio"
                  value={form.applikacio || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Külön élvezetgomb"}
                  handleChange={handleChange}
                  name="kulon_elvezetgomb"
                  value={form.kulon_elvezetgomb || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Szívó módok"}
                  handleChange={handleChange}
                  name="szivo_modok"
                  value={form.szivo_modok || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Tapogatás módok"}
                  handleChange={handleChange}
                  name="tapogatas_modok"
                  value={form.tapogatas_modok || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Ütögetés"}
                  handleChange={handleChange}
                  name="utogetes"
                  value={form.utogetes || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Vezérlés"}
                  handleChange={handleChange}
                  name="vezerles"
                  value={form.vezerles || ""}
                  placeholder=""
                  classname={""}
                />
              </div>
              <div className="space-y-2 w-full mt-0 lg:mt-7">
                <SmallTextInput
                  legend={"Fűtés funkció"}
                  handleChange={handleChange}
                  name="futes_funkcio"
                  value={form.futes_funkcio || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Szívó rezgő módok"}
                  handleChange={handleChange}
                  name="szivo_rezgo_modok"
                  value={form.szivo_rezgo_modok || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Nyalás módok"}
                  handleChange={handleChange}
                  name="nyalas_modok"
                  value={form.nyalas_modok || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Lökés módok"}
                  handleChange={handleChange}
                  name="lokes_modok"
                  value={form.lokes_modok || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Sebességfokozatok"}
                  handleChange={handleChange}
                  name="sebessegfokozatok"
                  value={form.sebessegfokozatok || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Vibrációs módok"}
                  handleChange={handleChange}
                  name="vibracios_modok"
                  value={form.vibracios_modok || ""}
                  placeholder=""
                  classname={""}
                />
              </div>
            </div>

            <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
              <div className="space-y-2 w-full">
                <Paragraph classname={"text-[var(--pink)] font-bold"}>
                  Egyéb
                </Paragraph>
                <SmallTextInput
                  legend={"Töltés"}
                  handleChange={handleChange}
                  name="toltes"
                  value={form.toltes || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Töltési idő"}
                  handleChange={handleChange}
                  name="toltesi_ido"
                  value={form.toltesi_ido || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Használati idő"}
                  handleChange={handleChange}
                  name="hasznalati_ido"
                  value={form.hasznalati_ido || ""}
                  placeholder=""
                  classname={""}
                />
                <Textarea
                  legend={"GYIK"}
                  handleChange={handleChange}
                  name="gyik"
                  value={form.gyik || ""}
                  placeholder=""
                  classname={""}
                  rows={4}
                />
              </div>
              <div className="space-y-2 w-full mt-0 lg:mt-7">
                <SmallTextInput
                  legend={"Zajszint"}
                  handleChange={handleChange}
                  name="zajszint"
                  value={form.zajszint || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Vízállóság"}
                  handleChange={handleChange}
                  name="vizallosag"
                  value={form.vizallosag || ""}
                  placeholder=""
                  classname={""}
                />
                <SmallTextInput
                  legend={"Tárolás"}
                  handleChange={handleChange}
                  name="tarolas"
                  value={form.tarolas || ""}
                  placeholder=""
                  classname={""}
                />
                <Textarea
                  legend={"Tisztitas"}
                  handleChange={handleChange}
                  name="tisztitas"
                  value={form.tisztitas || ""}
                  placeholder=""
                  classname={""}
                  rows={3}
                />
              </div>
            </div>
          </div>
          {/* SEO */}
          <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
            <div className="space-y-2 w-full">
              <div className="flex flex-nowrap gap-2 items-start mb-4">
                <TbSeo className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>SEO</H3>
              </div>
              <div className="space-y-4 relative md:w-full overflow-hidden rounded-lg bg-white">
                <Label classname={"font-bold p-2 text-xs"}>OG Image</Label>
                <div
                  className="relative cursor-pointer group"
                  onClick={() => {
                    pickerModeRef.current = "og_image";
                    setMediaModalOpen(true);
                  }}
                >
                  <Image
                    src={selectedOGImage || "/default.png"}
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
            </div>
            <div className="space-y-2 w-full mt-0 lg:mt-12">
              {/* SEO Építő – ez automatikusan frissíti a form.seo_title-t */}
              <SeoTitleBuilder
                form={form}
                siteName="Yourlove.hu"
                value={form.seo_title || ""}
                onChange={(t) => setForm((p) => ({ ...p, seo_title: t }))}
              />
              <SmallTextInput
                legend={"SEO Cím"}
                handleChange={handleChange}
                name="seo_title"
                value={form.seo_title || ""}
                placeholder=""
                classname={""}
              />
              <SmallTextInput
                legend={"SEO Slug"}
                handleChange={handleChange}
                name="seo_slug"
                value={form.seo_slug || ""}
                placeholder=""
                classname={""}
              />
              <Textarea
                legend={"Meta leírás"}
                handleChange={handleChange}
                name="meta_leiras"
                value={form.meta_leiras || ""}
                placeholder=""
                classname={""}
                rows={4}
              />
              <SmallTextInput
                legend={"OG Cím"}
                handleChange={handleChange}
                name="og_title"
                value={form.og_title || ""}
                placeholder=""
                classname={""}
              />
              <SmallTextInput
                legend={"Termékkép alt"}
                handleChange={handleChange}
                name="termekkep_alt"
                value={form.termekkep_alt || ""}
                placeholder=""
                classname={""}
              />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
          <ToggleSwitch checked={published} onChange={setPublished} firstlabel={"Vázlat"} secondlabel={"Közzétéve"}/>
          <div className="flex flex-row gap-2">
            <AdminCancelButton
              title={"Mégse"}
              link={""}
              onclick={handleClose}
              buttonicon={"TbX"}
            />
            <AdminDeleteButton
              title="Törlés"
              onconfirm={handleDelete}
              buttonicon="TbTrash"
            />
            <AdminSaveButton
              title={"Mentés"}
              link={""}
              onclick={handleSave}
              buttonicon={"TbDeviceFloppy"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
