"use client"

import { useContext } from "react"
import Link from "next/link"
import { AdminMenuContext } from "@/app/AdminContext"
import { TbPlus } from "react-icons/tb"

export default function AdminSliderListSettings() {
    const { setSearchTerm } = useContext(AdminMenuContext)

    return (
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 px-6 pb-6">
            <div className="relative w-full md:w-96">
                <input
                    type="text"
                    placeholder="Slide keresése..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-full outline-none focus:border-[var(--pink)]"
                />
            </div>

            <Link
                href="/admin/sliderek/uj"
                className="flex items-center gap-2 px-6 py-2 bg-[var(--green)] hover:bg-[var(--green-hover)] text-white rounded-full transition-colors whitespace-nowrap"
            >
                <TbPlus className="w-5 h-5" />
                <span>Új slide</span>
            </Link>
        </div>
    )
}
