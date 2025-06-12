"use client";

import React from "react";
import Image from "next/image";
import H1 from "./UI/Texts/H1";
import Paragraph from "./UI/Texts/Paragraph";
import CategoryFilterBar from "./BlogCategoryFilterBar";
import { Suspense } from "react";

export default function BlogHero() {
  return (
    <>
      <div className="flex flex-col items-center justify-center relative w-full xl:h-[70vh] h-[60vh] rounded-2xl">
        <div
          className={`absolute top-0 left-0 w-full h-full bg-[var(--grey-bg)] rounded-2xl`}
        ></div>
        <div className="w-full flex flex-col gap-8 items-start justify-between">
          <div className="flex flex-col items-center gap-8 z-10 w-full">
            <H1 classname={`text-center`}>Blogok, tesztek, történetek.</H1>
            <Paragraph classname={`text-center lg:w-1/3 w-full`}>
              Ha szeretnél többet megtudni termékekről, vagy csak simán
              olvasgatnál néhány pikáns történetet jó helyen jársz. Fejleszd a
              tudásod az ágyban, itt tényleg tanulhatsz!
            </Paragraph>
          </div>
        </div>
        <div className="absolute lg:-bottom-6 -bottom-12 z-10">
          <Suspense fallback={<div>Betöltés...</div>}>
            <CategoryFilterBar />
          </Suspense>
        </div>
      </div>
    </>
  );
}
