"use client";

import { useState, useEffect } from "react";
import AccountPageSkeleton from "@/app/components/UI/AccountPageSkeleton";
import { TbShoppingCart } from "react-icons/tb"
import { addToCart as addToCartAction } from '@/app/_actions/cart'

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/favorites', { cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          setFavorites(await res.json());
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("loadFavorites error:", err);
        setFavorites([]);
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

  return <FavoritesView favorites={favorites} onAddToCart={(pid) => addToCart(pid, 1)} />;
}

function FavoritesView({ favorites, onAddToCart }) {
  if (!favorites.length) return <p>Még nincsenek kedvenceid.</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Kedvencek</h2>
      <ul className="space-y-2">
        {favorites.map((p) => (
          <li key={p.id} className="py-3 flex items-center justify-between gap-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              {p.image && (
                <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-gray-600">{formatHuf(p.price)}</div>
              </div>
            </div>
            <button
              onClick={() => onAddToCart(p.id)}
              className="flex flex-nowrap gap-2 items-center rounded-lg px-3 py-1 text-sm bg-[var(--pink)] text-white hover:bg-[var(--pink-hover)] cursor-pointer shrink-0"
            >
              <TbShoppingCart />
              Kosárba
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatHuf(v) {
  return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(v);
}
