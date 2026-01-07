"use client"

import { useContext, useState, useEffect } from "react"
import Link from "next/link"
import { AdminMenuContext } from "@/app/AdminContext"
import { TbEye, TbEyeOff, TbExternalLink, TbEdit } from "react-icons/tb"

export default function AdminAnnouncementList({ announcements, loading }) {
    const { searchTerm } = useContext(AdminMenuContext)
    const [filteredAnnouncements, setFilteredAnnouncements] = useState(announcements || [])

    useEffect(() => {
        if (!announcements) return

        const filtered = announcements.filter((announcement) => {
            if (!searchTerm) return true
            const search = searchTerm.toLowerCase()
            return (
                announcement.content?.toLowerCase().includes(search) ||
                announcement.link_url?.toLowerCase().includes(search)
            )
        })

        setFilteredAnnouncements(filtered)
    }, [searchTerm, announcements])

    if (loading) {
        return (
            <>
                {/* Desktop (táblázat) skeleton */}
                <div className="hidden md:block px-3 md:px-6">
                    <div className="relative w-full max-w-full overflow-x-auto border border-[var(--border,#e5e7eb)] rounded-2xl">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#f5f5f5]">
                                <tr>
                                    <th className="text-left px-3 py-3">
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3">
                                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3 hidden lg:table-cell">
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3 hidden xl:table-cell">
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3 hidden xl:table-cell">
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-right px-3 py-3 w-[140px]">
                                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse ml-auto"></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-t border-[var(--border,#e5e7eb)]">
                                        <td className="px-3 py-3">
                                            <div className="h-5 w-8 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3 hidden lg:table-cell">
                                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3 hidden xl:table-cell">
                                            <div className="flex gap-2">
                                                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 hidden xl:table-cell">
                                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3 w-[140px]">
                                            <div className="flex gap-2 justify-end">
                                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobil (kártya) skeleton */}
                <div className="md:hidden px-3 space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="ring ring-[var(--border,#e5e7eb)] rounded-2xl p-3"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    if (!announcements || announcements.length === 0) {
        return (
            <div className="px-6">
                <p className="text-gray-500">
                    Még nincsenek hirdetések. Hozz létre egyet az "Új hirdetés" gombbal!
                </p>
            </div>
        )
    }

    if (!filteredAnnouncements || filteredAnnouncements.length === 0) {
        return (
            <div className="px-6">
                <p className="text-gray-500">
                    {searchTerm ? "Nincs találat a keresésre." : "Még nincsenek hirdetések. Hozz létre egyet!"}
                </p>
            </div>
        )
    }

    return (
        <>
            {/* ====== Táblázat (md és fölötte) ====== */}
            <div className="hidden md:block px-3 md:px-6">
                <div className="relative w-full max-w-full overflow-x-auto border border-[var(--border,#e5e7eb)] rounded-2xl">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                            <tr>
                                <th className="text-left font-semibold px-3 py-3">Sorrend</th>
                                <th className="text-left font-semibold px-3 py-3">Tartalom</th>
                                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">Link</th>
                                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">Színek</th>
                                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">Állapot</th>
                                <th className="text-right font-semibold px-3 py-3 w-[140px] min-w-[140px]">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredAnnouncements.map((announcement) => (
                                <tr
                                    key={announcement.id}
                                    className="border-t border-[var(--border,#e5e7eb)] hover:bg-gray-50"
                                >
                                    <td className="px-3 py-3 align-middle">
                                        <span className="font-semibold text-gray-600">{announcement.display_order}</span>
                                    </td>
                                    <td className="px-3 py-3 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-semibold line-clamp-2">{announcement.content || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                                        {announcement.link_url ? (
                                            <a
                                                href={announcement.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[var(--pink)] hover:underline text-xs truncate block max-w-[200px]"
                                            >
                                                {announcement.link_url}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded border border-gray-300"
                                                style={{ backgroundColor: announcement.bg_color }}
                                                title={`BG: ${announcement.bg_color}`}
                                            />
                                            <div
                                                className="w-6 h-6 rounded border border-gray-300"
                                                style={{ backgroundColor: announcement.text_color }}
                                                title={`Text: ${announcement.text_color}`}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                                        <div className="flex items-center gap-2">
                                            {announcement.published ? (
                                                <>
                                                    <TbEye className="text-[var(--green)] w-4 h-4" />
                                                    <span className="text-[var(--green)] font-semibold">Közzétéve</span>
                                                </>
                                            ) : (
                                                <>
                                                    <TbEyeOff className="text-gray-400 w-4 h-4" />
                                                    <span className="text-gray-500">Vázlat</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="pl-3 align-middle w-[140px] min-w-[140px]">
                                        <div className="flex items-center justify-end gap-0 h-[56px]">
                                            <Link
                                                href="/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Főoldal előnézet"
                                                className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                                            >
                                                <TbExternalLink className="text-[var(--pink)] w-5 h-auto" />
                                            </Link>
                                            <Link
                                                href={`/admin/hirdetesek/${announcement.id}`}
                                                aria-label="Szerkesztés"
                                                className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                                            >
                                                <TbEdit className="w-5 h-auto" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== Kártyás nézet (mobil, md alatt) ====== */}
            <div className="md:hidden px-3 space-y-2">
                {filteredAnnouncements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className="ring ring-[var(--border,#e5e7eb)] rounded-2xl p-3 border-l-4 border-white"
                    >
                        <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-semibold">#{announcement.display_order}</span>
                                    <div className="font-semibold line-clamp-2 text-sm">{announcement.content || '—'}</div>
                                </div>
                                {announcement.link_url && (
                                    <div className="text-xs text-[var(--pink)] mt-1 truncate">{announcement.link_url}</div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    {announcement.published ? (
                                        <>
                                            <TbEye className="text-[var(--green)] w-4 h-4" />
                                            <span className="text-[var(--green)] text-xs font-semibold">Közzétéve</span>
                                        </>
                                    ) : (
                                        <>
                                            <TbEyeOff className="text-gray-400 w-4 h-4" />
                                            <span className="text-gray-500 text-xs">Vázlat</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Főoldal előnézet"
                                    >
                                        <TbExternalLink className="text-[var(--pink)] w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={`/admin/hirdetesek/${announcement.id}`}
                                        aria-label="Szerkesztés"
                                    >
                                        <TbEdit className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
