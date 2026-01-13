"use client";

import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbCoins, TbPlus, TbMinus } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";
import { adjustPoints } from "@/app/_actions/loyalty-points";
import { toast } from "react-toastify";

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

function formatPoints(points) {
    return new Intl.NumberFormat('hu-HU').format(points || 0);
}

function AdminPointsList({ users }) {
    const { searchTerm } = useContext(AdminMenuContext);
    const supabase = useMemo(() => createClient(), []);

    const [rows, setRows] = useState(users || []);
    const [adjusting, setAdjusting] = useState(null); // userId being adjusted

    useEffect(() => {
        setRows(users || []);
    }, [users]);

    const refetch = useCallback(async () => {
        const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .order("points", { ascending: false });

        if (!error) setRows(data || []);
    }, [supabase]);

    useEffect(() => {
        const onChanged = () => refetch();
        window.addEventListener("admin:points:changed", onChanged);
        return () => window.removeEventListener("admin:points:changed", onChanged);
    }, [refetch]);

    const handleAdjustPoints = async (userId, points, reason) => {
        if (!points || points === 0) {
            toast.error('Add meg a pontszámot');
            return;
        }

        const result = await adjustPoints(userId, points, reason);

        if (result.ok) {
            toast.success(`Pontok sikeresen ${points > 0 ? 'hozzáadva' : 'levonva'}`);
            window.dispatchEvent(new Event('admin:points:changed'));
            setAdjusting(null);
            refetch();
        } else {
            toast.error(result.error || 'Hiba történt');
        }
    };

    const filtered = useMemo(() => {
        if (!searchTerm) return rows;
        const term = searchTerm.toLowerCase();

        return (rows || []).filter((u) => {
            const fullName = `${u.firstname || ""} ${u.lastname || ""}`.trim().toLowerCase();
            const contact = `${u.email || ""}`.toLowerCase();

            return (
                fullName.includes(term) ||
                contact.includes(term) ||
                (u.id && u.id.toLowerCase().includes(term))
            );
        });
    }, [rows, searchTerm]);

    if (!rows || rows.length === 0) {
        return (
            <div className="px-3 md:px-6">
                <div className="text-center py-12 text-gray-500">
                    Betöltés...
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block px-3 md:px-6">
                <div className="relative w-full max-w-full overflow-x-auto border border-[var(--border)] rounded-2xl">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                            <tr>
                                <th className="text-left font-semibold px-3 py-3">Felhasználó</th>
                                <th className="text-left font-semibold px-3 py-3">Email</th>
                                <th className="text-right font-semibold px-3 py-3">Pontok</th>
                                <th className="text-left font-semibold px-3 py-3">Regisztráció</th>
                                <th className="text-right font-semibold px-3 py-3 w-[150px] min-w-[150px]">Műveletek</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {filtered.map((user) => {
                                const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Névtelen";
                                const isAdjusting = adjusting === user.id;

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 border-t border-[var(--border)] transition-colors">
                                        <td className="px-3 py-3 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--pink)]/10 flex items-center justify-center flex-shrink-0">
                                                    <TbCoins className="w-5 h-5 text-[var(--pink)]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{fullName}</span>
                                                    <span className="text-xs text-gray-400 font-mono" title={user.id}>{user.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 align-middle">
                                            <a href={`mailto:${user.email}`} className="text-[var(--pink)] hover:underline truncate block max-w-[200px]">
                                                {user.email}
                                            </a>
                                        </td>

                                        <td className="px-3 py-3 align-middle text-right">
                                            <span className="font-bold text-lg text-[var(--pink)]">
                                                {formatPoints(user.points)}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 align-middle whitespace-nowrap text-gray-500">
                                            {formatDateTime(user.created_at)}
                                        </td>

                                        <td className="pl-3 align-middle w-[150px] min-w-[150px]">
                                            <div className="flex items-center justify-end gap-1 h-[56px]">
                                                {isAdjusting ? (
                                                    <div className="flex gap-1">
                                                        <input
                                                            type="number"
                                                            id={`adjust-${user.id}`}
                                                            placeholder="+/- pont"
                                                            className="w-20 px-2 py-1 border border-[var(--border)] rounded text-sm"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const value = parseInt(e.currentTarget.value);
                                                                    handleAdjustPoints(user.id, value, 'Admin módosítás');
                                                                } else if (e.key === 'Escape') {
                                                                    setAdjusting(null);
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => setAdjusting(null)}
                                                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleAdjustPoints(user.id, 100, 'Admin +100 pont')}
                                                            className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                                            title="+ 100 pont"
                                                        >
                                                            <TbPlus className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAdjustPoints(user.id, -100, 'Admin -100 pont')}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                                            title="- 100 pont"
                                                        >
                                                            <TbMinus className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setAdjusting(user.id)}
                                                            className="px-3 py-1 text-xs bg-[var(--pink)]/10 text-[var(--pink)] hover:bg-[var(--pink)]/20 rounded-lg transition-colors"
                                                            title="Egyéni módosítás"
                                                        >
                                                            Módosít
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden px-3 space-y-3 pb-6">
                {filtered.map((user) => {
                    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Névtelen";
                    const isAdjusting = adjusting === user.id;

                    return (
                        <div key={user.id} className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[var(--pink)]/10 flex items-center justify-center flex-shrink-0">
                                        <TbCoins className="w-6 h-6 text-[var(--pink)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{fullName}</h3>
                                        <p className="text-xs text-gray-400">Reg: {formatDateTime(user.created_at)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-[var(--pink)]">{formatPoints(user.points)}</div>
                                    <div className="text-xs text-gray-500">pont</div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Email</span>
                                    <a href={`mailto:${user.email}`} className="text-gray-900 truncate">{user.email}</a>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isAdjusting ? (
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="number"
                                            placeholder="+/- pont"
                                            className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = parseInt(e.currentTarget.value);
                                                    handleAdjustPoints(user.id, value, 'Admin módosítás');
                                                } else if (e.key === 'Escape') {
                                                    setAdjusting(null);
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => setAdjusting(null)}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAdjustPoints(user.id, 100, 'Admin +100 pont')}
                                            className="flex-1 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <TbPlus className="w-5 h-5" />
                                            <span className="text-sm font-medium">+100</span>
                                        </button>
                                        <button
                                            onClick={() => handleAdjustPoints(user.id, -100, 'Admin -100 pont')}
                                            className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <TbMinus className="w-5 h-5" />
                                            <span className="text-sm font-medium">-100</span>
                                        </button>
                                        <button
                                            onClick={() => setAdjusting(user.id)}
                                            className="px-4 py-2 bg-[var(--pink)]/10 text-[var(--pink)] hover:bg-[var(--pink)]/20 rounded-lg transition-colors"
                                        >
                                            Egyéni
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default AdminPointsList;
