import React from "react";
import WhiteButton from "./UI/WhiteButton";
import H1 from "./UI/Texts/H1";
import H2 from "./UI/Texts/H2";
import Paragraph from "./UI/Texts/Paragraph";
import Image from "next/image";
import { TbSpyOff } from "react-icons/tb"

export default function PrivateShipping() {
  return (
      <div className="w-full rounded-2xl border border-[var(--border)] p-4">
        <div className="flex lg:flex-row flex-col lg:gap-16 gap-8 justify-between lg:items-center items-center w-full">
            <TbSpyOff className="text-white bg-[var(--pink)] p-2 rounded-lg min-w-16 h-16"/>
            <H2 classname={"text-[var(--pink)] lg:text-left text-center lg:w-3/4"}>100%-ban diszkrét csomagolás</H2>
            <Paragraph classname={"w-full lg:text-left text-center"}>A csomagod feladója egy semleges nevű cég lesz, illetve bankkártyás fizetésnél a termék és az üzlet neve sem látszik.</Paragraph>
        </div>
      </div>
  );
}
