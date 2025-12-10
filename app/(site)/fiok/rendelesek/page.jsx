"use client";

import { useState, useEffect } from "react";
import AccountPageSkeleton from "@/app/components/UI/AccountPageSkeleton";
import H4 from "@/app/components/UI/Texts/H4";
import { TbShoppingCartShare, TbShoppingCart } from "react-icons/tb"
import { addToCart as addToCartAction } from '@/app/_actions/cart'

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          setOrders(await res.json());
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("loadOrders error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function addToCart(productId, qty = 1) {
    const res = await addToCartAction(productId, qty);
    if (res?.ok) {
      window.dispatchEvent(new Event('cart:changed'));
      window.dispatchEvent(new Event('cart:open'));
    } else {
      alert(res?.message || "Nem sikerült kosárba tenni a terméket.");
    }
  }

  if (loading) return <AccountPageSkeleton />;

  return <OrdersView orders={orders} onRebuy={addToCart} />;
}

function OrdersView({ orders, onRebuy }) {
  if (!orders.length) return <p>Még nincs rendelésed.</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Korábbi rendelések</h2>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-sm">
                <H4 className="font-medium">#{o.order_number}</H4>
                <div className="text-gray-600 flex flex-wrap items-center gap-2">
                  <span>{new Date(o.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span>{formatHuf(o.total)}</span>
                  <span
                    className={
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " +
                      statusColor(o.status)
                    }
                  >
                    {statusLabel(o.status)}
                  </span>
                </div>

              </div>
            </div>

            <ul className="">
              {o.items.map((it) => (
                <li key={it.id} className="py-3 flex items-center justify-between gap-3 border-b border-[var(--border)]">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{it.name}</div>
                    <div className="text-xs text-gray-600">
                      {it.qty} × {formatHuf(it.unit_price)}
                    </div>
                  </div>
                  <button
                    className="flex flex-nowrap gap-2 items-center rounded-lg px-3 py-1 text-sm bg-[var(--green)] hover:bg-[var(--green-hover)] cursor-pointer shrink-0"
                    onClick={() => {
                      const pid = it.product_id ?? it.productId;
                      onRebuy(pid, it.qty);
                    }}
                  >
                    <TbShoppingCart />
                    Kosárba újra
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="flex flex-nowrap gap-2 items-center place-self-end rounded-lg px-3 py-1 text-sm text-white bg-[var(--pink)] hover:bg-[var(--pink-hover)] cursor-pointer"
              onClick={async () => {
                for (const it of o.items) {
                  const pid = it.product_id ?? it.productId;
                  await onRebuy(pid, it.qty);
                }
              }}
            >
              <TbShoppingCartShare />
              Kosárba az összeset
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHuf(v) {
  return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(v);
}

function statusLabel(value) {
  switch (value) {
    case "draft": return "Piszkozat"
    case "neworder": return "Új rendelés"
    case "processing": return "Feldolgozás alatt"
    case "pending_payment": return "Fizetésre vár"
    case "paid": return "Fizetve"
    case "shipped": return "Kiszállítva"
    case "delivered": return "Futárnak átadva"
    case "cancelled": return "Törölve"
    default: return value || "Ismeretlen"
  }
}

function statusColor(value) {
  switch (value) {
    case "draft": return "bg-gray-200 text-gray-700"
    case "neworder": return "bg-[var(--pink)] text-white"
    case "processing": return "bg-blue-100 text-blue-700"
    case "pending_payment": return "bg-amber-100 text-amber-700"
    case "paid": return "bg-emerald-100 text-emerald-700"
    case "shipped": return "bg-indigo-100 text-indigo-700"
    case "delivered": return "bg-green-100 text-green-800"
    case "cancelled": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}
