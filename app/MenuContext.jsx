// MenuContext.js
'use client';

import { createContext, useRef, useState, useCallback, useEffect } from "react";

export const MenuContext = createContext({
  // desktop submenu
  subMenu: null,
  setSubMenu: () => {},
  cancelCloseSubmenu: () => {},
  scheduleCloseSubmenu: () => {},

  // mobile drawer
  isMobileOpen: false,
  openMobileMenu: () => {},
  closeMobileMenu: () => {},
});

export default function MenuContextProvider({ children }) {
  // --- desktop submenu ---
  const [subMenu, setSubMenuState] = useState(null);
  const closeTimeoutRef = useRef(null);

  const setSubMenu = useCallback((slug) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSubMenuState(slug ?? null);
  }, []);

  const scheduleCloseSubmenu = useCallback((delayMs = 300) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setSubMenuState(null);
      closeTimeoutRef.current = null;
    }, delayMs);
  }, []);

  const cancelCloseSubmenu = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // --- mobile drawer ---
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openMobileMenu = useCallback(() => setIsMobileOpen(true), []);
  const closeMobileMenu = useCallback(() => setIsMobileOpen(false), []);

  // body scroll lock mobil menü alatt
  useEffect(() => {
    if (isMobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobileOpen]);

  return (
    <MenuContext.Provider
      value={{
        subMenu, setSubMenu, scheduleCloseSubmenu, cancelCloseSubmenu,
        isMobileOpen, openMobileMenu, closeMobileMenu
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
