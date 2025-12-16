"use client"

import { useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AdminMenuContext } from "@/app/AdminContext"
import { TbEye, TbEyeOff, TbExternalLink, TbEdit } from "react-icons/tb"

export default function AdminCustomPagesList({ pages, loading }) {
  const { searchTerm } = useContext(AdminMenuContext)
  const router = useRouter()
  const [filteredPages, setFilteredPages] = useState(pages || [])

  useEffect(() => {
    if (!pages) return

    const filtered = pages.filter((page) => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        page.cim?.toLowerCase().includes(search) ||
        page.slug?.toLowerCase().includes(search) ||
        page.meta_title?.toLowerCase().includes(search)
      )
    })

    setFilteredPages(filtered)
  }, [searchTerm, pages])

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Betöltés...</p>
      </div>
    )
  }

  if (!filteredPages || filteredPages.length === 0) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          {searchTerm ? "Nincs találat a keresésre." : "Még nincsenek egyedi oldalak. Hozz létre egyet!"}
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Kép</th>
              <th className="text-left font-semibold px-4 py-3">Cím</th>
              <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Slug</th>
              <th className="text-left font-semibold px-4 py-3 hidden lg:table-cell">Állapot</th>
              <th className="text-left font-semibold px-4 py-3 hidden xl:table-cell">Létrehozva</th>
              <th className="text-right font-semibold px-3 py-3 w-[140px] min-w-[140px]">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="border-b border-[var(--border)] hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                    {page.fokep ? (
                      <Image
                        src={page.fokep}
                        alt={page.fokep_alt || page.cim || "Oldal kép"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Nincs kép
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{page.cim}</div>
                  <div className="text-sm text-gray-500 md:hidden">{page.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/p/{page.slug}</code>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    {page.kozzeteve ? (
                      <>
                        <TbEye className="text-green-600" />
                        <span className="text-green-600 text-sm font-medium">Közzétéve</span>
                      </>
                    ) : (
                      <>
                        <TbEyeOff className="text-gray-400" />
                        <span className="text-gray-500 text-sm">Vázlat</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 hidden xl:table-cell">
                  {page.created_at ? new Date(page.created_at).toLocaleDateString('hu-HU') : '-'}
                </td>
                <td className="pl-3 align-middle w-[140px] min-w-[140px]">
                  <div className="flex items-center justify-end gap-0 h-[72px]">
                    <Link
                      href={`/p/${encodeURIComponent(page.slug || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Megnyitás új lapon"
                      className="flex items-center justify-center hover:bg-gray-100 w-1/2 h-full"
                    >
                      <TbExternalLink className="text-[var(--pink)] w-5 h-auto" />
                    </Link>
                    <Link
                      href={`/admin/oldalkeszito/${page.id}`}
                      aria-label="Szerkesztés"
                      className="flex items-center justify-center hover:bg-gray-100 w-1/2 h-full"
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
  )
}
