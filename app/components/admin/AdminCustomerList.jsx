"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit, TbTrash } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import Image from "next/image";

function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AdminCustomerList({ users }) {
    const { searchTerm } = useContext(AdminMenuContext);
    const supabase = useMemo(() => createClient(), []);

    // --- saját state + prop szinkron ---
    const [rows, setRows] = useState(users || []);
    useEffect(() => {
        setRows(users || []);
    }, [users]);

    // --- refetch az adatbázisból ---
    const refetch = useCallback(async () => {
        const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .order("created_at", { ascending: false });
        
        if (!error) setRows(data || []);
    }, [supabase]);

     // custom event figyelése
     useEffect(() => {
        const onChanged = () => refetch();
        window.addEventListener("admin:customers:changed", onChanged);
        return () => window.removeEventListener("admin:customers:changed", onChanged);
      }, [refetch]);

    // --- szűrés keresőmező szerint ---
    const filtered = useMemo(() => {
        if (!searchTerm) return rows;
        const term = searchTerm.toLowerCase();

        return (rows || []).filter((u) => {
            const fullName = `${u.firstname || ""} ${u.lastname || ""}`.trim().toLowerCase();
            const contact = `${u.email || ""} ${u.phone || ""}`.toLowerCase();
            const addr = `${u.billing_zip || ""} ${u.billing_city || ""} ${u.billing_address || ""}`.toLowerCase();
            
            return (
                fullName.includes(term) ||
                contact.includes(term) ||
                addr.includes(term) ||
                (u.id && u.id.toLowerCase().includes(term))
            );
        });
    }, [rows, searchTerm]);


    if (!rows || rows.length === 0) {
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
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3 hidden lg:table-cell">
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3 hidden xl:table-cell">
                                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-left px-3 py-3">
                                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                                    </th>
                                    <th className="text-right px-3 py-3 w-[100px]">
                                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse ml-auto"></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-t border-[var(--border,#e5e7eb)]">
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3 hidden lg:table-cell">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3 hidden xl:table-cell">
                                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-3 py-3 w-[100px]">
                                            <div className="flex gap-2 justify-end">
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
                <div className="md:hidden px-3 space-y-3 pb-6">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-[var(--border,#e5e7eb)] rounded-2xl p-4"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }


    return (
        <>
        {/* ====== Táblázat (md és fölötte) ====== */}
        <div className="hidden md:block px-3 md:px-6">
            <div className="relative w-full max-w-full overflow-x-auto border border-[var(--border,#e5e7eb)] rounded-2xl">
            <table className="min-w-full text-sm">
                <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                <tr>
                    <th className="text-left font-semibold px-3 py-3">Vásárló</th>
                    <th className="text-left font-semibold px-3 py-3">Email</th>
                    <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">Telefon</th>
                    <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">Lakcím</th>
                    <th className="text-left font-semibold px-3 py-3">Regisztráció</th>
                    <th className="text-right font-semibold px-3 py-3 w-[100px] min-w-[100px]">Műveletek</th>
                </tr>
                </thead>

                <tbody className="bg-white">
                {filtered.map((user) => {
                    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Névtelen";
                    const avatar = user.avatar_url || null;
                    const hrefAdmin = `/admin/vasarlok/${user.id}`;
                    
                    // Cím összerakása
                    const addressParts = [
                        user.billing_zip, 
                        user.billing_city, 
                        user.billing_address
                    ].filter(Boolean);
                    const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "—";


                    return (
                    <tr key={user.id} className="hover:bg-gray-100 border-b border-gray-100 last:border-0 transition-colors">
                        {/* Vásárló */}
                        <td className="px-3 py-3 align-middle">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                    {avatar ? (
                                        <Image src={avatar} alt={fullName} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <TbEdit className="w-5 h-5" /> 
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900">{fullName}</span>
                                    <span className="text-xs text-gray-400 font-mono" title={user.id}>{user.id.substring(0,8)}...</span>
                                </div>
                            </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-3 align-middle">
                            <a href={`mailto:${user.email}`} className="text-[var(--pink)] hover:underline truncate block max-w-[200px]">
                                {user.email}
                            </a>
                        </td>

                        {/* Telefon - lg+ */}
                        <td className="px-3 py-3 align-middle hidden lg:table-cell">
                            {user.phone ? (
                                <a href={`tel:${user.phone}`} className="text-gray-600 hover:text-gray-900">
                                    {user.phone}
                                </a>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </td>

                        {/* Lakcím - xl+ */}
                         <td className="px-3 py-3 align-middle hidden xl:table-cell">
                             <span className="text-gray-600 truncate block max-w-[250px]" title={fullAddress}>
                                 {fullAddress}
                             </span>
                        </td>


                        {/* Regisztráció */}
                        <td className="px-3 py-3 align-middle whitespace-nowrap text-gray-500">
                            {formatDateTime(user.created_at)}
                        </td>

                        {/* Műveletek */}
                        <td className="pl-3 align-middle w-[100px] min-w-[100px]">
                        <div className="flex items-center justify-end gap-1 h-[56px]">
                            <Link
                                href={hrefAdmin}
                                scroll={false} // fontos az intercepting route miatt
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[var(--pink)] transition-colors"
                                title="Részletek"
                            >
                                <TbEdit className="w-5 h-5" />
                            </Link>
                        </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>

        {/* ====== Kártyás nézet (mobil, md alatt) ====== */}
        <div className="md:hidden px-3 space-y-3 pb-6">
            {filtered.map((user) => {
                 const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Névtelen";
                 const avatar = user.avatar_url || null;
                 const hrefAdmin = `/admin/vasarlok/${user.id}`;
                 
                 const addressParts = [
                     user.billing_zip, 
                     user.billing_city, 
                     user.billing_address
                 ].filter(Boolean);
                 const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "—";


            return (
                <div key={user.id} className="bg-white border border-[var(--border,#e5e7eb)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                {avatar ? (
                                    <Image src={avatar} alt={fullName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <TbEdit className="w-6 h-6" /> 
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{fullName}</h3>
                                <p className="text-xs text-gray-400">Reg: {formatDateTime(user.created_at)}</p>
                            </div>
                        </div>
                         <Link
                                href={hrefAdmin}
                                scroll={false}
                                className="p-2 rounded-lg bg-[var(--pink)]/10 text-[var(--pink)] hover:bg-[var(--pink)]/20 transition-colors"
                            >
                                <TbEdit className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Email</span>
                            <a href={`mailto:${user.email}`} className="text-gray-900 truncate">{user.email}</a>
                        </div>
                        
                         {user.phone && (
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Telefon</span>
                                <a href={`tel:${user.phone}`} className="text-gray-900">{user.phone}</a>
                            </div>
                        )}

                        <div className="flex flex-col">
                             <span className="text-xs text-gray-500 uppercase font-semibold">Lakcím</span>
                             <span className="text-gray-900 break-words">{fullAddress}</span>
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
        </>
    );
}

export default AdminCustomerList;
