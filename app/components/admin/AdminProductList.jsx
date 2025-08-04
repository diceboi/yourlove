"use client";

import React from "react";
import Image from "next/image";
import Label from "../UI/Texts/Label";
import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminMenuContext } from "@/app/AdminContext";
import {
  TbExternalLink,
  TbChevronDown,
  TbChevronUp,
  TbEdit,
} from "react-icons/tb";
import MediaLibraryModal from "./MediaLibraryModal";

export default function AdminProductList({ products }) {

  const router = useRouter();

  const { searchTerm } = useContext(AdminMenuContext);

  // Szűrt termékek keresés alapján
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;

    const term = searchTerm.toLowerCase();

    return products.filter((product) => {
      return (
        product.id?.toString().toLowerCase().includes(term) ||
        product.cikkszam?.toLowerCase().includes(term) ||
        product.vonalkod?.toLowerCase().includes(term) ||
        product.seo_slug?.toLowerCase().includes(term) ||
        product.szallito_nev?.toLowerCase().includes(term) ||
        product.gyarto?.toLowerCase().includes(term) ||
        product.kategoria?.toLowerCase().includes(term) ||
        product.cimkek?.toLowerCase().includes(term) ||
        product.anyag?.toLowerCase().includes(term) ||
        product.kulso_anyag?.toLowerCase().includes(term) ||
        product.belso_anyag?.toLowerCase().includes(term) ||
        product.tok_szin?.toLowerCase().includes(term) ||
        product.alcim?.toLowerCase().includes(term) ||
        product.meta_leiras?.toLowerCase().includes(term) ||
        product.termekleiras?.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-2">
      {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="relative flex flex-row justify-between border border-[var(--border)] bg-white rounded-2xl"
          >
            <div className="flex flex-row w-full ">
              <Image
                src={product.termekkep || "/default.png"}
                width={50}
                height={50}
                alt={product.seo_slug || "termek-kep"}
                className="mr-4 rounded-md m-2"
              />
              <div className="flex flex-col gap-2 justify-center w-40 border-r border-[var(--border)]">
                <Label classname="font-bold">{product.fo_cim}</Label>
                <Label>{product.cikkszam}</Label>
              </div>
              <div className="flex flex-col gap-2 w-80 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname={"font-bold text-center"}>
                  {product.kategoria}
                </Label>
              </div>
              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                <Label classname={"font-bold text-center"}>
                  {product.cimkek}
                </Label>
              </div>
              <div className="flex flex-col gap-2 justify-center items-center w-30 border-r border-[var(--border)] px-2">
                <Label classname={"text-[var(--green)] font-bold text-center"}>
                  {product.eladasi_ar_brutto || product.akcios_ar_brutto} Ft
                </Label>
              </div>
              <div className="flex flex-col gap-2 justify-center items-center w-30 border-r border-[var(--border)] px-2">
                <Label classname={"font-bold text-center"}>
                  {product.keszlet} db
                </Label>
              </div>
              <div className="flex flex-col gap-2 w-30 justify-center items-center border-r border-[var(--border)] px-2">
                {product.kozzeteve === true && (
                  <Label
                    classname={"font-bold text-center text-[var(--green)]"}
                  >
                    Közzétéve
                  </Label>
                )}
                {product.kozzeteve === false && (
                  <Label
                    classname={"font-bold text-center text-[var(--warning)]"}
                  >
                    Vázlat
                  </Label>
                )}
              </div>
            </div>
            <div className="flex flex-row items-center justify-end gap-8 px-8 w-full">
              <button>
                <TbExternalLink className="text-[var(--pink)]" />
              </button>
              <button
                onClick={() =>
                  router.push(`/admin/termekek/${product.seo_slug}`)
                }
                className="cursor-pointer"
              >
                <TbChevronDown />
              </button>
            </div>
          </div>
      ))}
    </div>
  );
}
