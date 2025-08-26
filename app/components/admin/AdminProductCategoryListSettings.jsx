"use client"

import AdminProductSearch from "./AdminProductSearch";
import AddProductButton from "../UI/Buttons/AddProductButton";
import Label from "../UI/Texts/Label";
import { TbChevronDown } from "react-icons/tb";

export default function AdminProductCategoryListSettings() {
  return (
    <div className="flex flex-col gap-2 sticky top-0 bg-[var(--grey-bg)] py-2 z-20 px-6">
      <div className="flex flex-row gap-2 items-center justify-between">
        <AdminProductSearch />
        <AddProductButton
          title={"Termékkategória hozzáadása"}
          buttonicon={"TbFolders"}
        />
      </div>
      <div className="flex flex-row w-full items-center">
        <div className="w-56 px-2">
          <Label>Név</Label>
        </div>
        <div className="w-76 px-2">
          <Label>Slug</Label>
        </div>
        <div className="w-28 px-2">
          <Label>Elérés</Label>
        </div>
        <div className="flex flex-row gap-2 w-28 px-2">
          <Label>Azonosító</Label>
          <button><TbChevronDown /></button>
        </div>
      </div>
    </div>
  );
}
