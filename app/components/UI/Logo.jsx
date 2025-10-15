"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo() {

  return (
    <Link
      id="logo"
      href={"/"}
      className="relative xl:min-w-[200px] min-w-[150px] xl:h-[50px] h-[40px]"
    >
      <Image
        src="/yourlove-logo.svg"
        fill
        style={{ objectFit: "contain" }}
        alt="YourLove Logo"
      />
    </Link>
  );
}
