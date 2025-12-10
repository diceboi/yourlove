"use client";

import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbX } from "react-icons/tb";
import { MenuContext } from "@/app/MenuContext";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function UserMenuDrawer() {
  const { activeDrawer, closeDrawer } = useContext(MenuContext);
  const router = useRouter();
  const isOpen = activeDrawer === 'user';

  const doLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info("Sikeres kijelentkezés!");
    closeDrawer();
    window.dispatchEvent(new Event('auth:changed'));
    router.push("/bejelentkezes");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed flex inset-0 z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/35" onClick={closeDrawer} />

          {/* Drawer */}
          <motion.aside
            className="relative ml-auto bg-white flex flex-col w-[90vw] md:w-[400px] h-full shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)]">
              <div className="text-xl font-semibold">Fiókom</div>
              <button onClick={closeDrawer} className="p-2 rounded hover:bg-gray-100">
                <TbX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
               <DrawerLink href="/admin/vezerlopult" onClick={closeDrawer}>Admin felület</DrawerLink>
               <DrawerLink href="/fiok/fiokadatok" onClick={closeDrawer}>Fiók adatok</DrawerLink>
               <DrawerLink href="/fiok/cimek" onClick={closeDrawer}>Címek</DrawerLink>
               <DrawerLink href="/fiok/rendelesek" onClick={closeDrawer}>Korábbi rendelések</DrawerLink>
               <DrawerLink href="/fiok/kedvencek" onClick={closeDrawer}>Kedvencek</DrawerLink>
               <DrawerLink href="/fiok/jelszo" onClick={closeDrawer}>Jelszó változtatás</DrawerLink>
               <div className="h-px bg-gray-100 my-2" />
               <button 
                onClick={doLogout}
                className="text-left w-full px-4 py-3 rounded-xl hover:bg-gray-50 text-[var(--error)] font-medium transition-colors"
               >
                 Kijelentkezés
               </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DrawerLink({ href, children, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="block w-full px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-medium transition-colors"
    >
      {children}
    </Link>
  )
}
