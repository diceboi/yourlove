import React from "react";
import Paragraph from "./Texts/Paragraph";
import Image from "next/image";
import Label from "./Texts/Label";
import ProductPriceTextSmall from "./Texts/ProductPriceTextSmall";
import AddToCartButtonSmall from "./Buttons/AddToCartButtonSmall";
import Link from "next/link";

export default function ProductUpsale(color) {
  return (
    <div className="flex flex-col gap-2">
      {color && (
        <>
          <Label classname={"text-[var(--secondary-text)]"}>
            Válassz hozzá kiegészítőt:
          </Label>
          <div className="flex flex-auto flex-wrap gap-1">
            <div className="flex flex-nowrap gap-2 border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
              <div className="termekszin relative w-[50px] h-[50px]">
                <Image
                  src={"/termekszinek/1.jpg"}
                  fill
                  style={{ objectFit: "cover" }}
                  alt="termekszin"
                />
              </div>
              <div className="flex flex-col gap-2 p-2">
                <Label classname={"cursor-pointer"}>Sikosító 100ml</Label>
                <ProductPriceTextSmall classname={"cursor-pointer"}>
                  5 990 Ft
                </ProductPriceTextSmall>
              </div>
            </div>
            <div className="flex flex-nowrap gap-2 border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
              <div className="termekszin relative w-[50px] h-[50px]">
                <Image
                  src={"/termekszinek/2.jpg"}
                  fill
                  style={{ objectFit: "cover" }}
                  alt="termekszin"
                />
              </div>
              <div className="flex flex-col gap-2 p-2">
                <Label classname={"cursor-pointer"}>Sikosító 100ml</Label>
                <ProductPriceTextSmall classname={"cursor-pointer"}>
                  5 990 Ft
                </ProductPriceTextSmall>
              </div>
            </div>
            <div className="flex flex-nowrap gap-2 border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
              <div className="termekszin relative w-[50px] h-[50px]">
                <Image
                  src={"/termekszinek/3.jpg"}
                  fill
                  style={{ objectFit: "cover" }}
                  alt="termekszin"
                />
              </div>
              <div className="flex flex-col gap-2 p-2">
                <Label classname={"cursor-pointer"}>Sikosító 100ml</Label>
                <ProductPriceTextSmall classname={"cursor-pointer"}>
                  5 990 Ft
                </ProductPriceTextSmall>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 bg-[var(--grey-bg)] p-4 rounded-md">
            <Label classname={"text-[var(--secondary-text)]"}>
              Már csak <span className="font-bold">8000 Ft</span> hiányzik az ingyenes szállításhoz!
            </Label>
            <Label classname={"text-[var(--black)] underline"}>
              <Link href={"#upsale"}>Mit tegyek a kosárba?</Link>
            </Label>
          </div>
        </>
      )}
    </div>
  );
}
