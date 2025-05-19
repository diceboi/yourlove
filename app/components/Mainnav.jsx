"use client";

import Image from "next/image";
import Logo from "./UI/Logo";
import SearchBarDesktop from "./SearchBarDesktop";
import UserMenu from "./UserMenu";
import LanguageSelect from "./LanguageSelect";
import MobileToggle from "./MobileToggle";
import Favourites from "./Favourites";
import Cart from "./Cart";
import MenuText from "./UI/MenuText";
import MainMenuItem from "./UI/MainMenuItem";
import SubmenuItem from "./UI/SubmenuItem";
import Paragraph from "./UI/MenuText";
import MainMenu from "./UI/MainMenu";
import Submenu from "./UI/Submenu";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { MenuContext } from "@/app/MenuContext";

export default function Mainnav() {

  const { subMenu } = useContext(MenuContext);

  return (
    <nav className="flex flex-col w-full xl:py-4 py-2">
      <div className="flex flex-col w-full xl:gap-6 gap-2">
        <div className="flex flex-row w-full justify-between gap-8">
          <div id="desktop-search-logo" className="xl:flex hidden flex-row w-fit gap-8 items-center justify-start">
            <Logo />
            <SearchBarDesktop />
          </div>
          <div id="mobile-logo" className="xl:hidden flex flex-row w-fit gap-8 items-center justify-start">
            <Logo />
          </div>
          <div className="flex flex-row w-fit items-center justify-end">
            <UserMenu />
            <LanguageSelect />
            <Favourites />
            <Cart />
            <MobileToggle />
          </div>
        </div>
        <div id="desktop-menu" className="hidden xl:flex flex-col gap-2">
          <MainMenu />
          <Submenu />
        </div>
        <div id="mobile-search" className="flex xl:hidden flex-col gap-2 min-w-full">
          <SearchBarDesktop />
        </div>
      </div>
    </nav>
  );
}
