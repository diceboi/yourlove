"use client"

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { MenuContext } from "@/app/MenuContext";
import Image from "next/image";
import MenuText from "./Texts/MenuText";

export default function MainMenuItem({ title, icon, onclick }) {
  const { subMenu, setSubMenu, cancelCloseSubmenu, scheduleCloseSubmenu } = useContext(MenuContext);
  const isActive = subMenu === onclick;
  const router = useRouter();

  return (
    <button
      onMouseEnter={() => {
        cancelCloseSubmenu();
        setSubMenu(onclick);
      }}
      onMouseLeave={scheduleCloseSubmenu}
      onClick={() => router.push(`/termekek/${onclick}`)}
      className={`relative group flex flex-nowrap ${icon ? 'pl-1 pr-2' : 'pl-2 pr-2'} gap-2 items-center justify-center h-[50px] mainmenu cursor-pointer ${isActive ? 'active' : ''}`}
    >
      {icon && (
        <Image src={icon} height={30} width={30} alt={title} className="opacity-75 group-hover:opacity-100" />
      )}
      <MenuText>{title}</MenuText>
    </button>
  );
}
