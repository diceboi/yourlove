'use client';

import { createContext, useRef, useState } from "react";

export const MenuContext = createContext({
  subMenu: false,
  setSubMenu: () => {},
  cancelCloseSubmenu: () => {},
  scheduleCloseSubmenu: () => {},
});

export default function MenuContextProvider({ children }) {
  const [subMenu, setSubMenu] = useState(false);
  const closeTimeoutRef = useRef(null);

  const openSubMenu = (value) => {
    clearTimeout(closeTimeoutRef.current); // töröljük a korábbi bezárást
    setSubMenu(value);
  };

  const scheduleCloseSubmenu = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSubMenu(false);
    }, 300);
  };

  const cancelCloseSubmenu = () => {
    clearTimeout(closeTimeoutRef.current);
  };

  return (
    <MenuContext.Provider value={{ subMenu, setSubMenu: openSubMenu, scheduleCloseSubmenu, cancelCloseSubmenu }}>
      {children}
    </MenuContext.Provider>
  );
}
