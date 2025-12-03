"use client";
import { useContext } from "react";
import { MenuContext } from "@/app/MenuContext";
import { TbMenu2 } from "react-icons/tb"

export default function MobileToggle() {
  const { isMobileOpen, openMobileMenu, closeMobileMenu } = useContext(MenuContext);
  const handleClick = () => (isMobileOpen ? closeMobileMenu() : openMobileMenu());

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={isMobileOpen ? "true" : "false"}
      className="flex xl:hidden xl:min-w-[44px] min-w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] items-center justify-center cursor-pointer"
      title="Menü"
    >
      <TbMenu2 className="w-6 h-6 text-[var(--pink)]"/>
    </button>
  );
}

