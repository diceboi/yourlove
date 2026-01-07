"use client"

import { useContext } from "react"
import Link from "next/link"
import { AdminMenuContext } from "@/app/AdminContext"
import { TbPlus } from "react-icons/tb"
import AdminAnnouncementSearch from "./AdminAnnouncementSearch"

export default function AdminAnnouncementListSettings() {
    const { setSearchTerm } = useContext(AdminMenuContext)

    return (
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 px-6 py-2 sticky xl:top-4 top-0 bg-[var(--grey-bg)] z-30">
            <AdminAnnouncementSearch />

            <Link
                href="/admin/hirdetesek/uj"
                className="flex items-center gap-2 px-6 py-2 bg-[var(--green)] hover:bg-[var(--green-hover)] text-white rounded-full transition-colors whitespace-nowrap"
            >
                <TbPlus className="w-5 h-5" />
                <span>Új hirdetés</span>
            </Link>
        </div>
    )
}
