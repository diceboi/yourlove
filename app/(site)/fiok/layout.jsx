"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import H2 from "@/app/components/UI/Texts/H2";


export default function AccountLayout({ children }) {
  const pathname = usePathname();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('auth:changed'));
    window.location.href = "/bejelentkezes";
  }

  return (
    <div className="flex flex-col gap-8 w-full xl:py-28 py-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <H2 className="text-2xl font-semibold mb-4">Fiók</H2>
      <div className="w-full flex flex-col-reverse lg:flex-row-reverse gap-6">
        {/* Content */}
        <main className="lg:w-2/3 w-full">
          {children}
        </main>

        {/* Sidebar */}
        <aside className="lg:w-1/3 w-full">
          <nav className="bg-[var(--grey-bg)] rounded-2xl p-2">
            <MenuLink href="/fiok/fiokadatok" active={pathname === "/fiok/fiokadatok"} label="Fiókadatok" />
            <MenuLink href="/fiok/cimadatok" active={pathname === "/fiok/cimadatok"} label="Címadatok" />
            <MenuLink href="/fiok/rendelesek" active={pathname === "/fiok/rendelesek"} label="Korábbi rendelések" />
            <MenuLink href="/fiok/kedvencek" active={pathname === "/fiok/kedvencek"} label="Kedvencek" />
            <div className="my-2 h-px bg-gray-200" />
            <MenuLink href="/fiok/jelszo" active={pathname === "/fiok/jelszo"} label="Jelszó változtatás" />
            <MenuLink href="/fiok/visszakuldes" active={pathname === "/fiok/visszakuldes"} label="Termék visszaküldés" />
            <button
              onClick={logout}
              className="mt-3 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm hover:bg-[var(--pink)] hover:text-white cursor-pointer"
            >
              Kijelentkezés
            </button>
          </nav>
        </aside>
      </div>
    </div>
  );
}

function MenuLink({ href, active, label }) {
  return (
    <Link
      href={href}
      className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition cursor-pointer
        ${active ? "bg-[var(--green)]" : "hover:bg-white"}`}
    >
      {label}
    </Link>
  );
}
