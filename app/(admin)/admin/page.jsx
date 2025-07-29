"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Box,
  ChevronDown,
  Database,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
  CreditCard,
  Tag,
  TrendingUp,
  Bell,
  Search,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";

export default function Component() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const sidebarItems = [
    { id: "dashboard", label: "Vezérlőpult", icon: Home },
    { id: "products", label: "Termékek", icon: Package, badge: "124" },
    { id: "orders", label: "Rendelések", icon: ShoppingCart, badge: "8" },
    { id: "customers", label: "Vásárlók", icon: Users },
    { id: "payments", label: "Fizetések", icon: CreditCard },
    { id: "discounts", label: "Akciók", icon: Tag },
  ];

  return (
    <div className="flex h-screen bg-[var(--grey-bg)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[var(--border)] flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? "bg-[var(--border)] text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-[var(--grey-bg)] hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--grey-bg)] text-gray-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Content area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
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
                {activeMenu === "reports" &&
                  "Generate detailed business reports"}
                {activeMenu === "database" &&
                  "Direct access to your database tables"}
                {activeMenu === "settings" &&
                  "Configure your store settings and preferences"}
              </p>
            </div>

            {/* Content placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-[var(--border)]">
                <h3 className="font-medium text-gray-900 mb-2">Quick Stats</h3>
                <p className="text-gray-600 text-sm">
                  Key metrics for your {activeMenu}
                </p>
                <div className="mt-4 h-32 bg-[var(--border)] rounded-md flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    Chart placeholder
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-[var(--border)]">
                <h3 className="font-medium text-gray-900 mb-2">
                  Recent Activity
                </h3>
                <p className="text-gray-600 text-sm">
                  Latest updates and changes
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      New order received
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Product updated
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Low stock alert
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-[var(--border)]">
                <h3 className="font-medium text-gray-900 mb-2">
                  Quick Actions
                </h3>
                <p className="text-gray-600 text-sm">
                  Common tasks for {activeMenu}
                </p>
                <div className="mt-4 space-y-2">
                  <button className="w-full flex items-center justify-start px-3 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--border)] transition-colors">
                    Add New Item
                  </button>
                  <button className="w-full flex items-center justify-start px-3 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--border)] transition-colors">
                    Export Data
                  </button>
                  <button className="w-full flex items-center justify-start px-3 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--border)] transition-colors">
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
