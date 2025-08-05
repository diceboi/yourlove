"use client";

import { useContext } from "react";
import { AdminMenuContext } from "@/app/AdminContext";

export default function AdminHero({ products }) {
  const { activeMenu, setActiveMenu } = useContext(AdminMenuContext);

  return (
    <div className="mx-auto p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 capitalize">{activeMenu}</span>
        </div>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 capitalize mb-2">
          Termékek
        </h1>
        <p className="text-gray-600">
          Overview of your ecommerce store performance
        </p>
      </div>
    </div>
  );
}
