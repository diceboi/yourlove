// MenuContext.js
'use client';

import { createContext, useRef, useState, useCallback, useEffect } from "react";

export const MenuContext = createContext({
  // desktop submenu
  subMenu: null,
  setSubMenu: () => {},
  cancelCloseSubmenu: () => {},
  scheduleCloseSubmenu: () => {},

  // unified drawer system
  activeDrawer: null, // null | 'mobile' | 'cart' | 'favorites' | 'compare' | 'user'
  setActiveDrawer: () => {},
  closeDrawer: () => {},

  // backward compatibility for mobile drawer
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

  // --- unified drawer system ---
  const [activeDrawer, setActiveDrawer] = useState(null);

  const closeDrawer = useCallback(() => setActiveDrawer(null), []);

  // backward compat mappings
  const isMobileOpen = activeDrawer === 'mobile';
  const openMobileMenu = useCallback(() => setActiveDrawer('mobile'), []);
  const closeMobileMenu = closeDrawer;

  // body scroll lock for ANY active drawer
  useEffect(() => {
    if (activeDrawer) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [activeDrawer]);

  return (
    <MenuContext.Provider
      value={{
        subMenu, setSubMenu, scheduleCloseSubmenu, cancelCloseSubmenu,
        activeDrawer, setActiveDrawer, closeDrawer,
        isMobileOpen, openMobileMenu, closeMobileMenu
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
