"use client";

import H2 from "@/app/components/UI/Texts/H2";
import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import Input from "@/app/components/UI/Inputfield/Input";
import Image from "next/image";
import { TbClick } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";

export default function AdminProductEdit({ product }) {
  const router = useRouter();

  const [published, setPublished] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between md:flex-row gap-4 p-6 z-1 border-b border-[var(--border)]">
        <H2 className="text-xl font-bold mb-2 w-full md:w-1/2">
          {product.seo_title || ""}
        </H2>
        <div className="flex flex-row justify-end items-center gap-4 w-full md:w-1/2">
          <div className="flex flex-nowrap items-center gap-2 border border-[var(--border)] p-2 rounded-lg h-fit">
            <TbClick className="text-[var(--pink)]" />
            <Paragraph>Kattintások: </Paragraph>
            <Paragraph classname={"text-[var(--pink)]"}>
              {product.kattintasok || ""}
            </Paragraph>
          </div>
          <ToggleSwitch
            checked={published}
            onChange={setPublished}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
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

          <div className="space-y-2 w-full md:w-1/2">
            <H3>Általános</H3>
            <Input
              legend={"Főcím"}
              handleChange={handleChange}
              name="fo_cim"
              value={product.fo_cim || ""}
              placeholder="Főcím"
              classname={""}
            />
            <Input
              legend={"Alcím"}
              handleChange={handleChange}
              name="alcim"
              value={product.alcim || ""}
              placeholder="Alcím"
              classname={""}
            />
            <Input
              legend={"Cikkszám"}
              handleChange={handleChange}
              name="id"
              value={product.cikkszam || ""}
              placeholder="Cikkszám"
              classname={""}
            />
            <Input
              legend={"Azonosító"}
              handleChange={handleChange}
              name="id"
              value={product.id || ""}
              placeholder="Azonosító"
              classname={""}
            />
            <Input
              legend={"Vonalkód"}
              handleChange={handleChange}
              name="vonalkod"
              value={product.vonalkod || ""}
              placeholder="Vonalkód"
              classname={""}
            />
            <Input
              legend={"Címkék"}
              handleChange={handleChange}
              name="cimkek"
              value={product.cimkek || ""}
              placeholder="Címkék"
              classname={""}
            />
            <Input
              legend={"Kategóriák"}
              handleChange={handleChange}
              name="kategoria"
              value={product.kategoria || ""}
              placeholder="Kategóriák"
              classname={""}
            />
          </div>
        </div>

        <div className="flex lg:flex-row flex-col gap-8">
          <div className="space-y-2 w-full">
            <Input
              legend={" "}
              handleChange={handleChange}
              name="id"
              value={product.cikkszam || ""}
              placeholder="Cikkszám"
              classname={""}
            />
            <Input
              legend={"Azonosító"}
              handleChange={handleChange}
              name="id"
              value={product.id || ""}
              placeholder="Azonosító"
              classname={""}
            />
            <Input
              legend={"Vonalkód"}
              handleChange={handleChange}
              name="vonalkod"
              value={product.vonalkod || ""}
              placeholder="Vonalkód"
              classname={""}
            />
          </div>
          <div className="space-y-2 w-full">
            <Input
              legend={"Főcím"}
              handleChange={handleChange}
              name="fo_cim"
              value={product.fo_cim || ""}
              placeholder="Főcím"
              classname={""}
            />
            <Input
              legend={"Alcím"}
              handleChange={handleChange}
              name="alcim"
              value={product.alcim || ""}
              placeholder="Alcím"
              classname={""}
            />
            <Input
              legend={"Cikkszám"}
              handleChange={handleChange}
              name="id"
              value={product.cikkszam || ""}
              placeholder="Cikkszám"
              classname={""}
            />
            <Input
              legend={"Azonosító"}
              handleChange={handleChange}
              name="id"
              value={product.id || ""}
              placeholder="Azonosító"
              classname={""}
            />
            <Input
              legend={"Vonalkód"}
              handleChange={handleChange}
              name="vonalkod"
              value={product.vonalkod || ""}
              placeholder="Vonalkód"
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
