"use client";

import { useContext } from "react";
import { AdminMenuContext } from "@/app/AdminContext";
import AdminTermekekPage from "@/app/components/admin/AdminProductPage";

export default function AdminMainContent({ products }) {
  const { activeMenu, setActiveMenu } = useContext(AdminMenuContext);

  return (
    <div className="flex-1 flex flex-col">
      {/* Content area */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto">
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
              {activeMenu}
            </h1>
            <p className="text-gray-600">
              {activeMenu === "dashboard" &&
                "Overview of your ecommerce store performance"}
              {activeMenu === "products" &&
                "Manage your product catalog and inventory"}
              {activeMenu === "orders" && "View and manage customer orders"}
              {activeMenu === "customers" &&
                "Manage customer accounts and data"}
              {activeMenu === "inventory" &&
                "Track stock levels and warehouse management"}
              {activeMenu === "analytics" &&
                "Analyze sales performance and customer behavior"}
              {activeMenu === "payments" &&
                "Manage payment methods and transactions"}
              {activeMenu === "discounts" &&
                "Create and manage promotional campaigns"}
              {activeMenu === "reports" && "Generate detailed business reports"}
              {activeMenu === "database" &&
                "Direct access to your database tables"}
              {activeMenu === "settings" &&
                "Configure your store settings and preferences"}
            </p>
          </div>

          {/* Content */}
          {activeMenu === "products" && <AdminTermekekPage products={products} />}
        </div>
      </main>
    </div>
  );
}
