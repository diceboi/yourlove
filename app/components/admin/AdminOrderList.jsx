"use client";

import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import Link from "next/link";
import { AdminMenuContext } from "@/app/AdminContext";
import { TbExternalLink, TbEdit } from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";

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

function formatMoneyHuf(value) {
  if (value == null) return "0 Ft";
  return value.toLocaleString("hu-HU") + " Ft";
}

function statusLabel(status) {
  switch (status) {
    case "draft":
      return { text: "Piszkozat", className: "text-gray-500" };
    case "processing":
      return { text: "Feldolgozás alatt", className: "text-blue-600" };
    case "pending_payment":
      return { text: "Fizetésre vár", className: "text-amber-600" };
    case "paid":
      return { text: "Fizetve", className: "text-[var(--green)]" };
    case "shipped":
      return { text: "Kiszállítva", className: "text-indigo-600" };
    case "delivered":
      return { text: "Átadva", className: "text-emerald-700" };
    case "cancelled":
      return { text: "Törölve", className: "text-red-600" };
    default:
      return { text: status || "Ismeretlen", className: "text-gray-600" };
  }
}

export default function AdminOrderList({ orders }) {
  const { searchTerm } = useContext(AdminMenuContext);
  const supabase = useMemo(() => createClient(), []);

  // --- saját state + prop szinkron ---
  const [rows, setRows] = useState(orders || []);
  useEffect(() => {
    setRows(orders || []);
  }, [orders]);

  // --- refetch az adatbázisból (orders tábla!) ---
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setRows(data || []);
  }, [supabase]);

  // custom event figyelése (új event név: admin:orders:changed)
  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("admin:orders:changed", onChanged);
    return () => window.removeEventListener("admin:orders:changed", onChanged);
  }, [refetch]);

  // --- szűrés keresőmező szerint ---
  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();

    return (rows || []).filter((o) => {
      const fullName = `${o.customer_firstname || ""} ${
        o.customer_lastname || ""
      }`
        .trim()
        .toLowerCase();
      const contact = `${o.email || ""} ${o.phone || ""}`.toLowerCase();
      const addr = `${o.billing_zip || ""} ${o.billing_city || ""} ${
        o.billing_address || ""
      }`.toLowerCase();
      const notes = (o.notes || "").toLowerCase();
      const status = (o.status || "").toLowerCase();

      return (
        o.order_number?.toString().toLowerCase().includes(term) ||
        o.id?.toString().toLowerCase().includes(term) ||
        fullName.includes(term) ||
        contact.includes(term) ||
        addr.includes(term) ||
        notes.includes(term) ||
        status.includes(term)
      );
    });
  }, [rows, searchTerm]);

  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col gap-2 animate-pulse px-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-[var(--border,#e5e7eb)] rounded-2xl w-full"
          />
        ))}
      </div>
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
                {/* Rendelés – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Rendelés
                </th>

                {/* Dátum – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Dátum
                </th>

                {/* Vevő – lg-től */}
                <th className="text-left font-semibold px-3 py-3 hidden lg:table-cell">
                  Vevő
                </th>

                {/* Elérhetőség – xl-től */}
                <th className="text-left font-semibold px-3 py-3 hidden xl:table-cell">
                  Elérhetőség
                </th>

                {/* Összeg – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Összeg
                </th>

                {/* Státusz – mindig látszik */}
                <th className="text-left font-semibold px-3 py-3">
                  Státusz
                </th>

                {/* Műveletek – fix szélesség */}
                <th className="text-right font-semibold px-3 py-3 w-[140px] min-w-[140px]">
                  Műveletek
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {filtered.map((order) => {
                const fullName =
                  `${order.customer_firstname || ""} ${
                    order.customer_lastname || ""
                  }`.trim() || "Vendég";
                const { text: statusText, className: statusClass } =
                  statusLabel(order.status);

                const contactSummary =
                  order.email || order.phone
                    ? `${order.email || ""}${
                        order.email && order.phone ? " • " : ""
                      }${order.phone || ""}`
                    : "—";

                const addressSummary =
                  order.billing_city || order.billing_address
                    ? `${order.billing_zip || ""} ${
                        order.billing_city || ""
                      }, ${order.billing_address || ""}`.trim()
                    : "";

                const hrefAdmin = `/admin/rendelesek/${order.order_number}`;

                return (
                  <tr
                    key={order.id}
                    className="border-t border-[var(--border,#e5e7eb)] hover:bg-gray-50"
                  >
                    {/* Rendelés (szám + ID) */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          #{order.order_number}
                        </span>
                      </div>
                    </td>

                    {/* Dátum */}
                    <td className="px-3 py-3 align-middle whitespace-nowrap">
                      {formatDateTime(order.created_at)}
                    </td>

                    {/* Vevő – lg+ */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="font-medium">{fullName}</span>
                        {addressSummary ? (
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {addressSummary}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Elérhetőség – xl+ */}
                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                      <span className="text-sm">{contactSummary}</span>
                    </td>

                    {/* Összeg */}
                    <td className="px-3 py-3 align-middle">
                      <span className="text-[var(--green)] font-bold">
                        {formatMoneyHuf(order.total_huf)}
                      </span>
                    </td>

                    {/* Státusz */}
                    <td className="px-3 py-3 align-middle">
                      <span className={`font-semibold ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>

                    {/* Műveletek */}
                    <td className="pl-3 align-middle w-[140px] min-w-[140px]">
                      <div className="flex items-center justify-end gap-0 h-[56px]">
                        <Link
                          href={hrefAdmin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Megnyitás új lapon"
                          className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                        >
                          <TbExternalLink className="text-[var(--pink)] w-5 h-auto" />
                        </Link>
                        <Link
                          href={hrefAdmin}
                          aria-label="Megnyitás / szerkesztés"
                          className="flex items-center justify-center hover:bg-white w-1/2 h-full"
                        >
                          <TbEdit className="w-5 h-auto" />
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
      <div className="md:hidden px-3 space-y-2">
        {filtered.map((order) => {
          const fullName =
            `${order.customer_firstname || ""} ${
              order.customer_lastname || ""
            }`.trim() || "Vendég";
          const { text: statusText, className: statusClass } = statusLabel(
            order.status
          );
          const hrefAdmin = `/admin/rendelesek/${order.id}`;

          const contactSummary =
            order.email || order.phone
              ? `${order.email || ""}${
                  order.email && order.phone ? " • " : ""
                }${order.phone || ""}`
              : "—";

          const addressSummary =
            order.billing_city || order.billing_address
              ? `${order.billing_zip || ""} ${order.billing_city || ""}, ${
                  order.billing_address || ""
                }`.trim()
              : "";

          return (
            <div
              key={order.id}
              className="border border-[var(--border,#e5e7eb)] bg-white rounded-2xl p-3"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">
                    Rendelés #{order.order_number}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(order.created_at)}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">{fullName}</span>
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <span className={`text-xs font-semibold ${statusClass}`}>
                    {statusText}
                  </span>
                  <span className="text-sm font-bold text-[var(--green)]">
                    {formatMoneyHuf(order.total_huf)}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <Link
                      href={hrefAdmin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Megnyitás új lapon"
                    >
                      <TbExternalLink className="text-[var(--pink)]" />
                    </Link>
                    <Link href={hrefAdmin} aria-label="Megnyitás / szerkesztés">
                      <TbEdit />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="text-gray-500">Elérhetőség</div>
                <div className="font-medium">{contactSummary}</div>

                <div className="text-gray-500">Számlázási cím</div>
                <div className="font-medium">
                  {addressSummary || <span className="text-gray-500">—</span>}
                </div>

                <div className="text-gray-500">Szállítás</div>
                <div className="font-medium">
                  {order.shipping_method || (
                    <span className="text-gray-500">—</span>
                  )}
                </div>

                {order.notes ? (
                  <>
                    <div className="text-gray-500">Megjegyzés</div>
                    <div className="font-medium line-clamp-2">
                      {order.notes}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
