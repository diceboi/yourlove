"use client";

import { useState, useEffect, useContext } from "react";
import { AdminMenuContext } from "@/app/AdminContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import {
  Home,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Tag,
  FolderKanban,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminSideMenu() {
  const { activeMenu, setActiveMenu } = useContext(AdminMenuContext);
  const router = useRouter();

  // 🔢 Dinamikus számláló a termékekhez
  const [productCount, setProductCount] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true }); // csak a darabszám kell
      if (error) {
        console.error("Termékek számlálása hiba:", error);
        setProductCount(0);
      } else {
        setProductCount(count ?? 0);
      }
    })();
  }, []);

  // ha csak a publikáltakat akarod számolni: add hozzá -> .eq("kozzeteve", true)

  const sidebarItems = [
    { id: "vezerlopult", label: "Vezérlőpult", icon: Home },
    { id: "termekek", label: "Termékek", icon: Package, badge: productCount ?? "…" },
    { id: "termekkategoriak", label: "Termék kategóriák", icon: FolderKanban },
    { id: "rendelesek", label: "Rendelések", icon: ShoppingCart },
    { id: "vasarlok", label: "Vásárlók", icon: Users },
    { id: "fizetesek", label: "Fizetések", icon: CreditCard },
    { id: "akciok", label: "Akciók", icon: Tag },
  ];

  const renderBadge = (badge) =>
    badge !== undefined && badge !== null ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--green)] text-white">
        {badge}
      </span>
    ) : null;

  return (
    <div className="md:w-64 bg-white md:border-r border-b border-[var(--border)] flex md:flex-row flex-col">
      <nav className="flex-1 md:py-4 py-0 px-4">
        {/* Desktop */}
        <div className="md:flex hidden flex-col space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => { router.push(`/admin/${item.id}`); setActiveMenu(item.id); }}
                className={`w-54 flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[var(--border)] text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-[var(--grey-bg)] hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {renderBadge(item.badge)}
              </button>
            );
          })}
        </div>

        {/* Mobile (Swiper) */}
        <div className="md:hidden flex">
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={4}
            slidesPerView={2.5}
            className="hidden w-full my-4"
            breakpoints={{ 640: { slidesPerView: 5, spaceBetween: 4 } }}
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <SwiperSlide key={item.id}>
                  <button
                    onClick={() => { router.push(`/admin/${item.id}`); setActiveMenu(item.id); }}
                    className={`w-44 flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-[var(--border)] text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-[var(--grey-bg)] hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {renderBadge(item.badge)}
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
