"use client";

import H2 from "@/app/components/UI/Texts/H2";
import H3 from "@/app/components/UI/Texts/H3";
import H4 from "@/app/components/UI/Texts/H4";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import Image from "next/image";
import { TbClick, TbBarcode, TbIdBadge2, TbShoppingBag, TbAlignJustified } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import Label from "@/app/components/UI/Texts/Label";

export default function AdminProductEdit({ product }) {
  const router = useRouter();

  const [published, setPublished] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 p-6 z-1 border-b border-[var(--border)]">
        <div className="flex md:flex-col flex-row w-full gap-2">
          <H2 className="text-xl font-bold mb-2 w-full md:w-1/2">
            {product.seo_title || ""}
          </H2>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-nowrap gap-1 items-start">
              <TbBarcode className="min-w-5 h-auto" />
              <Label classname={"mt-0.75"}>{product.vonalkod}</Label>
            </div>
            <div className="flex flex-nowrap gap-1 items-start">
              <TbIdBadge2 className="min-w-5 h-auto" />
              <Label classname={"mt-0.75"}>{product.id}</Label>
            </div>
            <div className="flex flex-nowrap gap-1 items-start">
              <TbIdBadge2 className="min-w-5 h-auto" />
              <Label classname={"mt-0.75"}>{product.cikkszam}</Label>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end items-center gap-4 w-full md:w-1/2">
          <div className="flex flex-nowrap items-center gap-2 border border-[var(--border)] p-2 rounded-lg h-fit">
            <TbClick className="text-[var(--pink)]" />
            <Paragraph>Kattintások: </Paragraph>
            <Paragraph classname={"text-[var(--pink)]"}>
              {product.kattintasok || ""}
            </Paragraph>
          </div>
          <ToggleSwitch checked={published} onChange={setPublished} />
        </div>
      </div>
      <div className="flex flex-col gap-16 p-6">
        <div className="flex flex-col md:flex-row gap-8 ">
          <div className="relative md:w-1/2 overflow-hidden rounded-lg">
            <Image
              src={product.termekkep || "/default.png"}
              width={300}
              height={300}
              alt={product.seo_slug || "termek-kep"}
              className="rounded-lg w-full h-auto"
            />
          </div>

          {/* ÁLTALÁNOS */}
          <div className="space-y-2 w-full md:w-1/2">
            <div className="flex flex-nowrap gap-2 items-start mb-4">
              <TbAlignJustified className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-sm text-white"/>
              <H3>Általános</H3>
            </div>
            <SmallTextInput
              legend={"Főcím"}
              handleChange={handleChange}
              name="fo_cim"
              value={product.fo_cim || ""}
              placeholder="Főcím"
              classname={""}
            />
            <SmallTextInput
              legend={"Alcím"}
              handleChange={handleChange}
              name="alcim"
              value={product.alcim || ""}
              placeholder="Alcím"
              classname={""}
            />
            <SmallTextInput
              legend={"Cikkszám"}
              handleChange={handleChange}
              name="id"
              value={product.cikkszam || ""}
              placeholder="Cikkszám"
              classname={""}
            />
            <SmallTextInput
              legend={"Azonosító"}
              handleChange={handleChange}
              name="id"
              value={product.id || ""}
              placeholder="Azonosító"
              classname={""}
            />
            <SmallTextInput
              legend={"Vonalkód"}
              handleChange={handleChange}
              name="vonalkod"
              value={product.vonalkod || ""}
              placeholder="Vonalkód"
              classname={""}
            />
            <SmallTextInput
              legend={"Gyártó"}
              handleChange={handleChange}
              name="gyarto"
              value={product.gyarto || ""}
              placeholder="Gyártó"
              classname={""}
            />
            <SmallTextInput
              legend={"Brand logó"}
              handleChange={handleChange}
              name="brand_logo"
              value={product.brand_logo || ""}
              placeholder="Brand logó"
              classname={""}
            />
            <SmallTextInput
              legend={"Címkék"}
              handleChange={handleChange}
              name="cimkek"
              value={product.cimkek || ""}
              placeholder="Címkék"
              classname={""}
            />
            <SmallTextInput
              legend={"Kategóriák"}
              handleChange={handleChange}
              name="kategoria"
              value={product.kategoria || ""}
              placeholder="Kategóriák"
              classname={""}
            />
          </div>
        </div>

        <Textarea
          legend={"Termékleírás"}
          handleChange={handleChange}
          name="id"
          value={product.termekleiras || ""}
          placeholder="Cikkszám"
          classname={""}
          rows={10}
        />

        {/* SZÁLLÍTÁS */}
        <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
          <div className="space-y-2 w-full">
            <div className="flex flex-nowrap gap-2 items-start mb-4">
              <TbShoppingBag className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-sm text-white"/>
              <H3>Szállítás és rendelés</H3>
            </div>
            <SmallTextInput
              legend={"Beszerzési ár nettó"}
              handleChange={handleChange}
              name="beszerzesi_ar_netto"
              value={product.beszerzesi_ar_netto || ""}
              placeholder=""
              classname={""}
              after={"Ft"}
            />
            <SmallTextInput
              legend={"Beszerzési ár bruttó"}
              handleChange={handleChange}
              name="beszerzesi_ar_brutto"
              value={product.beszerzesi_ar_brutto || ""}
              placeholder=""
              classname={""}
              after={"Ft"}
            />
            <SmallTextInput
              legend={"Akció mértéke (%)"}
              handleChange={handleChange}
              name="akcio_szazalek"
              value={product.akcio_szazalek || ""}
              placeholder=""
              classname={""}
              after={"%"}
            />
            <SmallTextInput
              legend={"Akció mértéke (Ft)"}
              handleChange={handleChange}
              name="akcio_ar"
              value={product.akcio_ar || ""}
              placeholder=""
              classname={""}
              after={"Ft"}
            />
            <SmallTextInput
              legend={"Bruttó eladási ár"}
              handleChange={handleChange}
              name="eladasi_ar_brutto"
              value={product.eladasi_ar_brutto || ""}
              placeholder=""
              classname={""}
              after={"Ft"}
            />
            <SmallTextInput
              legend={"Akciós eladási ár"}
              handleChange={handleChange}
              name="akcios_ar_brutto"
              value={product.akcios_ar_brutto || ""}
              placeholder=""
              classname={""}
              after={"Ft"}
            />
            <SmallTextInput
              legend={"Súly"}
              handleChange={handleChange}
              name="suly"
              value={product.suly || ""}
              placeholder=""
              classname={""}
              after={"gr"}
            />
          </div>
          <div className="space-y-2 w-full mt-0 lg:mt-12">
            <Textarea
              legend={"Csomag tartalma"}
              handleChange={handleChange}
              name="csomag_tartalma"
              value={product.csomag_tartalma || ""}
              placeholder=""
              classname={""}
              rows={3}
            />
            <SmallTextInput
              legend={"Csomagolás"}
              handleChange={handleChange}
              name="csomagolas"
              value={product.csomagolas || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Szállító név"}
              handleChange={handleChange}
              name="szallito_nev"
              value={product.szallito_nev || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Garancia"}
              handleChange={handleChange}
              name="garancia"
              value={product.garancia || ""}
              placeholder=""
              classname={""}
              after={"év"}
            />
            <SmallTextInput
              legend={"Min. rendelés"}
              handleChange={handleChange}
              name="minimalis_rendeles"
              value={product.minimalis_rendeles || ""}
              placeholder=""
              classname={""}
              after={"db"}
            />
            <SmallTextInput
              legend={"Szállítási idő"}
              handleChange={handleChange}
              name="szallitasi_ido"
              value={product.szallitasi_ido || ""}
              placeholder=""
              classname={""}
            />
          </div>
        </div>

        {/* RAKTÁRKEZELÉS */}
        <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
          <div className="space-y-2 w-full">
            <div className="flex flex-nowrap gap-2 items-start mb-4">
              <TbShoppingBag className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-sm text-white"/>
              <H3>Raktárkezelés</H3>
            </div>
            <SmallTextInput
              legend={"Készlet"}
              handleChange={handleChange}
              name="keszlet"
              value={product.keszlet || ""}
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
              value={product.polc || ""}
              placeholder=""
              classname={""}
            />
          </div>
        </div>

        {/* RÉSZLETES TERMÉKADATOK */}
        <div className="flex lg:flex-row flex-col lg:gap-8 gap-2">
          <div className="space-y-2 w-full">
            <div className="flex flex-nowrap gap-2 items-start mb-4">
              <TbShoppingBag className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-sm text-white"/>
              <H3>Részletes termékadatok</H3>
            </div>
            <Paragraph classname={"text-[var(--pink)] font-bold"}>Szín</Paragraph>
            <SmallTextInput
              legend={"Szín"}
              handleChange={handleChange}
              name="szin"
              value={product.szin || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Tok szín"}
              handleChange={handleChange}
              name="tok_szin"
              value={product.tok_szin || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Betét szín"}
              handleChange={handleChange}
              name="betet_szin"
              value={product.betet_szin || ""}
              placeholder=""
              classname={""}
            />
          </div>
          <div className="space-y-2 w-full mt-0 lg:mt-12">
            <Paragraph classname={"text-[var(--pink)] font-bold"}>Anyag</Paragraph>
            <SmallTextInput
              legend={"Anyag"}
              handleChange={handleChange}
              name="anyag"
              value={product.anyag || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Külső anyag"}
              handleChange={handleChange}
              name="kulso_anyag"
              value={product.kulso_anyag || ""}
              placeholder=""
              classname={""}
            />
            <SmallTextInput
              legend={"Belső anyag"}
              handleChange={handleChange}
              name="belso_anyag"
              value={product.belso_anyag || ""}
              placeholder=""
              classname={""}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 rounded bg-amber-500 text-white cursor-pointer"
      >
        Bezárás
      </button>
    </div>
  );
}
