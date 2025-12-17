"use client";

import { useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { AdminMenuContext } from "@/app/AdminContext";

const PAGE_CONFIG = [
  {
    match: "/admin/vezerlopult",
    title: "Vezérlőpult",
    subtitle: "Áttekintés a webáruház teljesítményéről",
  },
  {
    match: "/admin/termekek",
    title: "Termékek",
    subtitle: "Termékek kezelése, szerkesztése és publikálása",
  },
  {
    match: "/admin/termekkategoriak",
    title: "Termék kategóriák",
    subtitle: "Termék kategóriák kezelése, szerkesztése és publikálása",
  },
  {
    match: "/admin/termekcimkek",
    title: "Termék cimkék",
    subtitle: "Termék cimkék kezelése, szerkesztése és publikálása",
  },
  {
    match: "/admin/blogok",
    title: "Blogok",
    subtitle: "Blogok kezelése, szerkesztése és publikálása",
  },
  {
    match: "/admin/blogkategoriak",
    title: "Blog kategóriák",
    subtitle: "Blog kategóriák kezelése, szerkesztése és publikálása",
  },
  {
    match: "/admin/blogcimkek",
    title: "Blog cimkék",
    subtitle: "Blog cimkék kezelése, szerkesztése és publikálása",
  },
  {
    match: "/admin/rendelesek",
    title: "Rendelések",
    subtitle: "Beérkezett rendelések kezelése és státusz követése",
  },
  {
    match: "/admin/kategoriak",
    title: "Kategóriák",
    subtitle: "Termékkategóriák struktúrájának beállítása",
  },
  {
    match: "/admin/felhasznalok",
    title: "Felhasználók",
    subtitle: "Vásárlói fiókok és jogosultságok kezelése",
  },
  {
    match: "/admin/sliderek",
    title: "Sliderek",
    subtitle: "Főoldali slider beállítása és kezelése",
  },
  {
    match: "/admin/oldalkeszito",
    title: "Oldalkészítő",
    subtitle: "Egyedi oldalak létrehozása és szerkesztése",
  },
  // ide nyugodtan vehetsz fel még útvonalakat...
];

export default function AdminHero() {
  const { activeMenu } = useContext(AdminMenuContext);
  const pathname = usePathname();

  const { title, subtitle } = useMemo(() => {
    // 1) Próbálunk path alapján találni (kezeli a /[slug] aloldalakat is)
    const byPath = PAGE_CONFIG.find((cfg) =>
      pathname.startsWith(cfg.match)
    );
    if (byPath) return byPath;

    // 2) Ha az AdminMenuContext-ben van pl. "rendelesek", azt is kezelhetjük
    if (activeMenu) {
      const byMenu = PAGE_CONFIG.find((cfg) =>
        cfg.match.includes(activeMenu)
      );
      if (byMenu) return byMenu;
    }

    // 3) Fallback
    return {
      title: "Admin felület",
      subtitle: "Beállítások és tartalomkezelés",
    };
  }, [pathname, activeMenu]);

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 capitalize mb-2">
          {title}
        </h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}
