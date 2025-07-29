"use client";

import { createContext, useRef, useState } from "react";

export const AdminMenuContext = createContext({
  activeMenu: "dashboard",
  setActiveMenu: () => {},
});

export default function AdminMenuContextProvider({ children }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <AdminMenuContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </AdminMenuContext.Provider>
  );
}
