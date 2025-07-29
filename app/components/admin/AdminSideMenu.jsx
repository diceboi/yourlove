"use client";

import { useState, useEffect } from "react";
import { useContext } from "react";
import { AdminMenuContext } from "@/app/AdminContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

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

export default function AdminSideMenu() {
  const { activeMenu, setActiveMenu } = useContext(AdminMenuContext);

  const sidebarItems = [
    { id: "dashboard", label: "Vezérlőpult", icon: Home },
    { id: "products", label: "Termékek", icon: Package, badge: "124" },
    { id: "orders", label: "Rendelések", icon: ShoppingCart, badge: "8" },
    { id: "customers", label: "Vásárlók", icon: Users },
    { id: "payments", label: "Fizetések", icon: CreditCard },
    { id: "discounts", label: "Akciók", icon: Tag },
  ];

  return (
    <div className="md:w-64 bg-white md:border-r border-b border-[var(--border)] flex md:flex-row flex-col">
      <nav className="flex-1 md:py-4 py-0 px-4">
        <div className="md:flex hidden flex-col space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-54 flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-[var(--border)] text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-[var(--grey-bg)] hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--green)] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="md:hidden flex">
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={4}
            slidesPerView={2.5}
            className="hidden w-full my-4" // opcionális belső padding
            breakpoints={{
              640: { slidesPerView: 5, spaceBetween: 4 },
            }}
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <SwiperSlide>
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-44 flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-[var(--border)] text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-[var(--grey-bg)] hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--green)] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </nav>
    </div>
  );
}
