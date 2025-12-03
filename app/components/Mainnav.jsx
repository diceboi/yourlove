"use client";

import Logo from "./UI/Logo";
import UserMenu from "./UserMenu";
import Compare from "./Compare";
import MobileToggle from "./MobileToggle";
import Favourites from "./Favourites";
import CartButton from "./cart/CartButton";
import MenuText from "./UI/Texts/MenuText";
import MainMenuItem from "./UI/MainMenuItem";
import SubmenuItem from "./UI/SubmenuItem";
import Paragraph from "./UI/Texts/MenuText";
import MainMenu from "./UI/MainMenu";
import Submenu from "./UI/Submenu";
import MobileMenuDrawer from "./UI/MobileMenuDrawer";
import ContactUsMenu from "./ContactUsMenu";
import TopMenu from "./TopMenu";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { MenuContext } from "../MenuContext";
import { usePathname } from "next/navigation";
import SearchBar from "./search/SearchBar";

export default function MainNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolledEnough, setScrolledEnough] = useState(false);
  const { subMenu, cancelCloseSubmenu, scheduleCloseSubmenu } = useContext(MenuContext);

  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isShallowTermekekPage = pathSegments.length <= 2 && pathSegments[0] === "termekek";

  useEffect(() => {
    let timeoutId;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = window.innerHeight * 0.4;

      setScrolledEnough(currentScrollY > threshold);

      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (currentScrollY > lastScrollY + 20) {
          setIsVisible(false); // lefelé
        } else if (currentScrollY < lastScrollY - 20) {
          setIsVisible(true); // felfelé
        }
        setLastScrollY(currentScrollY);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  return (
    <>
      <TopMenu />
      <div
        className={`z-40 sticky top-0 left-0 bg-white xl:h-[84px] h-[54px] w-full`}
      >
        <div
          className={`flex flex-col xl:h-[84px] h-[60px] w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto bg-white ${isVisible ? "" : " lg:border-b border-0 border-[var(--border)]"}`}
        >
          <div className="flex flex-col w-full xl:gap-0 gap-2">
            <div className="flex flex-row w-full justify-between gap-8 z-50 xl:pt-4 pt-2 bg-white">
              <div
                id="desktop-search-logo"
                className="xl:flex hidden flex-row w-full gap-12 items-center justify-start"
              >
                <Logo />
                <ContactUsMenu />
                <SearchBar />
              </div>
              <motion.div
                id="mobile-logo"
                className={`xl:hidden flex flex-row w-fit gap-8 items-center justify-start`}
              >
                <Logo />
              </motion.div>
              <div className="flex flex-row min-w-fit items-center justify-end">
                <UserMenu />
                <Compare />
                <Favourites />
                <CartButton />
                <MobileToggle />
              </div>
            </div>
          </div>
        </div>
        <div
          id="desktop-menu"
          className="hidden xl:flex flex-col bg-white"
        >
          <MainMenu />
          <Submenu />
        </div>
        <motion.div
          id="mobile-search"
          className="flex xl:hidden bg-white py-2"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: isVisible ? -8 : -64, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-[calc(100%-32px)] mx-auto py-0">
            <SearchBar />
          </div>
        </motion.div>
      </div>
      <MobileMenuDrawer />
    </>
  );
}
