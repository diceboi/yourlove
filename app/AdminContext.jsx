"use client";

import { createContext, useState } from "react";

export const AdminMenuContext = createContext({
  activeMenu: "dashboard",
  setActiveMenu: () => {},
  searchTerm: "",
  setSearchTerm: () => {},
});

export default function AdminMenuContextProvider({ children }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <AdminMenuContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </AdminMenuContext.Provider>
  );
}
