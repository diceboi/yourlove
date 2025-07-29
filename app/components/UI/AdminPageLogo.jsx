"use client";

import Image from "next/image";
import Link from "next/link";
import { TbArrowNarrowLeft } from "react-icons/tb";

export default function AdminPageLogo() {
  return (
    <Link href={"/"} className="flex flex-nowrap items-center gap-4 ">
        <TbArrowNarrowLeft className="w-5 h-5 text-[var(--pink)]"/>
      <div
        id="logo"
        className="relative xl:min-w-[150px] min-w-[100px] xl:h-[50px] h-[40px]"
      >
        <Image
          src="/yourlove-logo.svg"
          fill
          style={{ objectFit: "contain" }}
          alt="YourLove Logo"
        />
      </div>
    </Link>
  );
}
