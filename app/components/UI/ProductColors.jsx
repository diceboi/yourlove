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
            <div className="termekszin relative w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                <Image src={"/termekszinek/1.jpg"} fill style={{objectFit: "cover"}} alt="termekszin"/>
            </div>
            <div className="termekszin relative w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                <Image src={"/termekszinek/2.jpg"} fill style={{objectFit: "cover"}} alt="termekszin"/>
            </div>
            <div className="termekszin relative w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                <Image src={"/termekszinek/3.jpg"} fill style={{objectFit: "cover"}} alt="termekszin"/>
            </div>
          </div>
          
        </>
      )}
    </div>
  );
}
