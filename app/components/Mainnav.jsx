"use client";

import Image from "next/image";
import Logo from "./UI/Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import LanguageSelect from "./LanguageSelect";
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
    <nav className="flex flex-col w-full py-4 px-12">
      <div className="flex flex-col w-full gap-6">
        <div className="flex flex-row w-full justify-between gap-8">
          <div className="flex flex-row w-fit gap-8 items-center justify-start">
            <Logo />
            <SearchBar />
          </div>
          <div className="flex flex-row w-fit items-center justify-end">
            <UserMenu />
            <LanguageSelect />
            <Favourites />
            <Cart />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <MainMenu />
          <Submenu />
        </div>
      </div>
    </nav>
  );
}
