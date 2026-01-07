"use client"

import Link from "next/link"
import AdminNewButton from "@/app/components/UI/Buttons/AdminNewButton"

export default function AdminCustomPageListSettings() {
  return (
    <div className="flex flex-col md:flex-row justify-end items-center gap-4 px-6 py-2 sticky xl:top-4 top-0 bg-[var(--grey-bg)] z-30">
      <Link href="/admin/oldalkeszito/uj">
        <AdminNewButton title="Új oldal" />
      </Link>
    </div>
  )
}
