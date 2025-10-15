import React from "react";
import Paragraph from "./Texts/Paragraph";
import Image from "next/image";
import Label from "./Texts/Label";

export default function ProductColors(color) {
  return (
    <div className="flex flex-col gap-2">
      {color && (
        <>
          <Label classname={"text-[var(--secondary-text)]"}>Elérhető színek:</Label>
          <div className="flex flex-row gap-1">
            <div className="border-2 border-transparent hover:border-[var(--black)] relative w-[20px] h-[20px] bg-blue-500 rounded-full cursor-pointer"></div>
            <div className="border-2 border-transparent hover:border-[var(--black)] relative w-[20px] h-[20px] bg-red-500 rounded-full cursor-pointer"></div>
            <div className="border-2 border-transparent hover:border-[var(--black)] relative w-[20px] h-[20px] bg-green-500 rounded-full cursor-pointer"></div>
          </div>
          
        </>
      )}
    </div>
  );
}
