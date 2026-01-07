"use client";

import { TbSearch } from "react-icons/tb";
import { useContext } from "react";
import { AdminMenuContext } from "@/app/AdminContext";

export default function AdminAnnouncementSearch() {
  const { searchTerm, setSearchTerm } = useContext(AdminMenuContext);

  return (
    <div>
      <div className="relative w-full mx-auto">
        <input
          type="text"
          placeholder="Hirdetés keresése..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="xl:min-w-fit min-w-full py-3 pl-12 pr-10 text-gray-800 bg-white rounded-full outline-none"
        />
        <TbSearch
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--pink)]"
          size={20}
        />
      </div>
    </div>
  );
}
