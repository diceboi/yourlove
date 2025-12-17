"use client"

import { useContext, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AdminMenuContext } from "@/app/AdminContext"
import { TbEye, TbEyeOff, TbExternalLink, TbEdit } from "react-icons/tb"

export default function AdminSliderList({ slides, loading }) {
    const { searchTerm } = useContext(AdminMenuContext)
    const [filteredSlides, setFilteredSlides] = useState(slides || [])

    useEffect(() => {
        if (!slides) return

        const filtered = slides.filter((slide) => {
            if (!searchTerm) return true
            const search = searchTerm.toLowerCase()
            return (
                slide.title?.toLowerCase().includes(search) ||
                slide.subtitle?.toLowerCase().includes(search) ||
                slide.button_title?.toLowerCase().includes(search)
            )
        })

        setFilteredSlides(filtered)
    }, [searchTerm, slides])

    if (loading || !slides || slides.length === 0) {
        return (
            <div className="flex flex-col gap-2 animate-pulse px-6">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-[var(--border,#e5e7eb)] rounded-2xl w-full"
                    />
                ))}
            </div>
        )
    }

    if (!filteredSlides || filteredSlides.length === 0) {
        return (
            <div className="px-6">
                <p className="text-gray-500">
                    {searchTerm ? "Nincs találat a keresésre." : "Még nincsenek slide-ok. Hozz létre egyet!"}
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
                                <th className="text-left font-semibold px-3 py-3">Kép</th>
                                <th className="text-left font-semibold px-3 py-3">Cím</th>
                                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">Alcím</th>
                                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">Gomb</th>
                                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">Állapot</th>
                                <th className="text-right font-semibold px-3 py-3 w-[140px] min-w-[140px]">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredSlides.map((slide) => (
                                <tr
                                    key={slide.id}
                                    className="border-t border-[var(--border,#e5e7eb)] hover:bg-gray-50"
                                >
                                    <td className="px-3 py-3 align-middle">
                                        <span className="font-semibold text-gray-600">{slide.display_order}</span>
                                    </td>
                                    <td className="px-3 py-3 align-middle">
                                        <div className="w-20 h-12 relative rounded overflow-hidden bg-gray-50">
                                            {slide.bg_image ? (
                                                <Image
                                                    src={slide.bg_image}
                                                    alt={slide.bg_image_alt || slide.title || "Slide kép"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    —
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{slide.title || '—'}</span>
                                            <span className="text-xs text-gray-500 md:hidden">{slide.subtitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                                        <span className="text-sm text-gray-600">{slide.subtitle || '—'}</span>
                                    </td>
                                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">{slide.button_title || '—'}</span>
                                            <span className="text-xs text-gray-400">{slide.button_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                                        <div className="flex items-center gap-2">
                                            {slide.published ? (
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
                                                href={`/admin/sliderek/${slide.id}`}
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
                {filteredSlides.map((slide) => (
                    <div
                        key={slide.id}
                        className="ring ring-[var(--border,#e5e7eb)] rounded-2xl p-3 border-l-4 border-white"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                {slide.bg_image ? (
                                    <Image
                                        src={slide.bg_image}
                                        alt={slide.bg_image_alt || slide.title || "Slide kép"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-semibold">#{slide.display_order}</span>
                                    <div className="font-semibold">{slide.title || '—'}</div>
                                </div>
                                {slide.subtitle && (
                                    <div className="text-xs text-gray-500 mt-1">{slide.subtitle}</div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    {slide.published ? (
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
                                        href={`/admin/sliderek/${slide.id}`}
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
