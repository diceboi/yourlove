"use client";

import { useState, useEffect } from "react";
import TermekekPage from "@/app/components/admin/AdminProductPage";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminMainContent from "@/app/components/admin/AdminMainContent";
import { useContext } from "react";
import { AdminMenuContext } from "@/app/AdminContext";

export default function AdminPageInner({ products }) {
  const { activeMenu, setActiveMenu } = useContext(AdminMenuContext);

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <AdminMainContent products={products} />
    </div>
  );
}
