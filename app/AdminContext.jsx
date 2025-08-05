"use client";

import { createContext, useState } from "react";

export const AdminMenuContext = createContext({
  activeMenu: "dashboard",
  setActiveMenu: () => {},
  searchTerm: "",
  setSearchTerm: () => {},
  togglePopup: () => {},
  openPopup: null,
  setOpenPopup: () => {},
});

export default function AdminMenuContextProvider({ children }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [openPopup, setOpenPopup] = useState(null);

  /* Modal */
  const togglePopup = (popupName) => {
    setOpenPopup((prevPopup) => (prevPopup === popupName ? null : popupName));
  };

  return (
    <AdminMenuContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        searchTerm,
        setSearchTerm,
        togglePopup,
        openPopup,
        setOpenPopup
      }}
    >
      {children}
    </AdminMenuContext.Provider>
  );
}
