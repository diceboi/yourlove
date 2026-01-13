"use client";

import { useEffect, useState } from "react";
import { getPointsHistory } from "@/app/_actions/loyalty-points";
import { TbCoins, TbShoppingCart, TbAdjustments, TbGift } from "react-icons/tb";

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
    return new Intl.NumberFormat("hu-HU").format(points || 0);
}

function getTransactionIcon(type) {
    switch (type) {
        case "purchase":
            return <TbShoppingCart className="w-5 h-5" />;
        case "redemption":
            return <TbGift className="w-5 h-5" />;
        case "admin_adjustment":
            return <TbAdjustments className="w-5 h-5" />;
        default:
            return <TbCoins className="w-5 h-5" />;
    }
}

function getTransactionColor(type) {
    switch (type) {
        case "purchase":
            return "text-green-600 bg-green-50";
        case "redemption":
            return "text-purple-600 bg-purple-50";
        case "admin_adjustment":
            return "text-blue-600 bg-blue-50";
        default:
            return "text-gray-600 bg-gray-50";
    }
}

function getTransactionLabel(type) {
    switch (type) {
        case "purchase":
            return "Vásárlás";
        case "redemption":
            return "Beváltás";
        case "admin_adjustment":
            return "Módosítás";
        case "expiry":
            return "Lejárat";
        default:
            return type;
    }
}

export default function UserPointsHistory({ userId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            const result = await getPointsHistory(userId, { limit: 20 });

            if (result.ok) {
                setHistory(result.data || []);
            } else {
                setError(result.error || "Hiba történt");
            }

            setLoading(false);
        }

        loadHistory();
    }, [userId]);

    if (loading) {
        return (
            <div className="py-8 text-center text-gray-500">
                Betöltés...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 text-center text-red-600">
                {error}
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                <TbCoins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Még nincs ponttranzakciód</p>
                <p className="text-sm mt-1">Vásárolj és gyűjts pontokat!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Desktop táblázat */}
            <div className="hidden md:block overflow-x-auto border border-[var(--border)] rounded-2xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#f5f5f5]">
                        <tr>
                            <th className="text-left font-semibold px-4 py-3">Dátum</th>
                            <th className="text-left font-semibold px-4 py-3">Típus</th>
                            <th className="text-left font-semibold px-4 py-3">Leírás</th>
                            <th className="text-right font-semibold px-4 py-3">Pontok</th>
                            <th className="text-right font-semibold px-4 py-3">Egyenleg</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {history.map((transaction) => {
                            const isPositive = transaction.points_earned > 0;
                            const pointsChange = isPositive
                                ? transaction.points_earned
                                : -transaction.points_spent;

                            return (
                                <tr
                                    key={transaction.id}
                                    className="border-t border-[var(--border)] hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                        {formatDateTime(transaction.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-2 rounded-lg ${getTransactionColor(
                                                    transaction.transaction_type
                                                )}`}
                                            >
                                                {getTransactionIcon(transaction.transaction_type)}
                                            </div>
                                            <span className="font-medium">
                                                {getTransactionLabel(transaction.transaction_type)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900">
                                                {transaction.description || "—"}
                                            </span>
                                            {transaction.orders?.order_number && (
                                                <a
                                                    href={`/fiok/rendelesek`}
                                                    className="text-xs text-[var(--pink)] hover:underline mt-1"
                                                >
                                                    Rendelés #{String(transaction.orders.order_number).padStart(6, '0')}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {isPositive ? "+" : ""}
                                        {formatPoints(pointsChange)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-[var(--pink)]">
                                        {formatPoints(transaction.balance_after)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile kártyák */}
            <div className="md:hidden space-y-3">
                {history.map((transaction) => {
                    const isPositive = transaction.points_earned > 0;
                    const pointsChange = isPositive
                        ? transaction.points_earned
                        : -transaction.points_spent;

                    return (
                        <div
                            key={transaction.id}
                            className="bg-white border border-[var(--border)] rounded-2xl p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-lg ${getTransactionColor(
                                            transaction.transaction_type
                                        )}`}
                                    >
                                        {getTransactionIcon(transaction.transaction_type)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {getTransactionLabel(transaction.transaction_type)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDateTime(transaction.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`text-lg font-bold ${isPositive ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {isPositive ? "+" : ""}
                                    {formatPoints(pointsChange)}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Leírás:</span>
                                    <span className="font-medium text-gray-900">
                                        {transaction.description || "—"}
                                    </span>
                                </div>
                                {transaction.orders?.order_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rendelés:</span>
                                        <a
                                            href={`/fiok/rendelesek`}
                                            className="text-[var(--pink)] hover:underline font-medium"
                                        >
                                            #{String(transaction.orders.order_number).padStart(6, '0')}
                                        </a>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-gray-600">Egyenleg után:</span>
                                    <span className="font-bold text-[var(--pink)]">
                                        {formatPoints(transaction.balance_after)} pont
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
