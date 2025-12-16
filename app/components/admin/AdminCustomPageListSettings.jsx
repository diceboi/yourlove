"use client"

import Link from "next/link"
import AdminNewButton from "@/app/components/UI/Buttons/AdminNewButton"

export default function AdminCustomPageListSettings() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
      <div>
        <h2 className="text-2xl font-bold">Egyedi oldalak</h2>
        <p className="text-gray-600">Hozz létre és kezelj egyedi landing page-eket</p>
      </div>
      <Link href="/admin/oldalkeszito/uj">
        <AdminNewButton title="Új oldal" />
      </Link>
    </div>
  )
}
