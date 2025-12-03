"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addToCart as addToCartAction } from '@/app/_actions/cart'
import H2 from "@/app/components/UI/Texts/H2";
import H3 from "@/app/components/UI/Texts/H3";
import H4 from "@/app/components/UI/Texts/H4";
import { TbShoppingCartShare, TbShoppingCart } from "react-icons/tb"
import AccountPageSkeleton from "@/app/components/UI/AccountPageSkeleton";

export default function AccountPage() {
  const [section, setSection] = useState("fiokadatok");
  const [loading, setLoading] = useState(true);

  // Állapotok
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  async function getJSON(url, fallback = null) {
    try {
      const r = await fetch(url, { cache: 'no-store', credentials: 'include' })
      if (!r.ok) return fallback
      return await r.json()
    } catch {
      return fallback
    }
  }

  // Betöltés Supabase API-król
  useEffect(() => {
    async function loadData() {
      try {
        // 🟢 1) Lekérések, cache nélkül
        const [p, a, o, f] = await Promise.all([
          getJSON('/api/account', null),
          getJSON('/api/account/addresses', []),
          getJSON('/api/orders', []),
          getJSON('/api/favorites', []),
        ])

        // 🟢 2) Fiókadatok (ha nincs p → üres default)
        if (p) {
          setProfile({
            vezeteknev: p.lastname || "",
            keresztnev: p.firstname || "",
            email: p.email || "",
            telefon: p.phone || "",
          })
        } else {
          setProfile({ vezeteknev: "", keresztnev: "", email: "", telefon: "" })
        }

        // 🟢 3) Többi adatrész
        setAddresses(a || [])
        setOrders(o || [])
        setFavorites(f || [])
      } catch (err) {
        console.error("loadData error:", err)
      } finally {
        // 🟢 4) Mindig lekapcsoljuk a "Betöltés..." státuszt
        setLoading(false)
      }
    }

    loadData()
  }, [])



  // API hívások
  async function saveAccount(data) {
    const res = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: data.keresztnev,
        lastname: data.vezeteknev,
        phone: data.telefon,
      }),
    })

    const payload = await res.json().catch(() => ({}))
    if (!res.ok || payload?.ok === false) {
      alert(`Nem sikerült menteni a fiókadatokat.\n${payload?.error || ""}`)
      return
    }

    // refetch
    const fresh = await getJSON('/api/account', null)
    if (fresh) {
      setProfile({
        vezeteknev: fresh.lastname || "",
        keresztnev: fresh.firstname || "",
        email: fresh.email || "",
        telefon: fresh.phone || "",
      })
    }
    // itt jöhet toast/alert: Mentve!
  }


  async function saveAddresses(addrs) {
    // mindet újra mentjük egyszerűen
    for (const a of addrs) {
      await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: a.nev,
          firstname: a.keresztnev,
          lastname: a.vezeteknev,
          country: a.orszag,
          zip: a.irsz,
          city: a.varos,
          line1: a.utca,
          phone: a.telefon,
          is_default: a.default,
        }),
      });
    }
    alert("Címek mentve!");
  }

  async function addToCart(productId, qty = 1) {
    const res = await addToCartAction(productId, qty)
    if (res?.ok) {
      window.dispatchEvent(new Event('cart:changed'))
      window.dispatchEvent(new Event('cart:open'))
    } else {
      alert(res?.message || "Nem sikerült kosárba tenni a terméket.")
    }
  }

  async function reloadAddresses() {
    const fresh = await getJSON('/api/account/addresses', [])
    setAddresses(fresh || [])
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('auth:changed'));
    window.location.href = "/bejelentkezes";
  }

  if (loading) return <AccountPageSkeleton />;

  return (
    <div className="flex flex-col gap-8 w-full xl:py-28 py-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <H2 className="text-2xl font-semibold mb-4">Fiók</H2>
      <div className="w-full flex flex-col-reverse lg:flex-row-reverse gap-6">
        {/* Tartalom */}
        <main className="lg:w-2/3 w-full">
          <div className="">
            {section === "fiokadatok" && (
              profile ? (
                <AccountForm value={profile} onChange={setProfile} onSave={() => saveAccount(profile)} />
              ) : (
                <p className="text-gray-500 text-sm">Betöltés...</p>
              )
            )}

            {section === "cimek" && (
              <AddressManager
                addresses={addresses}
                onChange={setAddresses}
                onReload={reloadAddresses}
              />

            )}
            {section === "rendelesek" && (
              <OrdersView orders={orders} onRebuy={addToCart} />
            )}
            {section === "kedvencek" && (
              <FavoritesView favorites={favorites} onAddToCart={(pid) => addToCart(pid, 1)} />
            )}
            {section === "jelszo" && <PasswordResetView />}
            {section === "visszakuldes" && <ReturnInfoView />}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:w-1/3 w-full ">
          <nav className="bg-[var(--grey-bg)] rounded-2xl p-2">
            <MenuButton active={section === "fiokadatok"} onClick={() => setSection("fiokadatok")} label="Fiókadatok" />
            <MenuButton active={section === "cimek"} onClick={() => setSection("cimek")} label="Címadatok" />
            <MenuButton active={section === "rendelesek"} onClick={() => setSection("rendelesek")} label="Korábbi rendelések" />
            <MenuButton active={section === "kedvencek"} onClick={() => setSection("kedvencek")} label="Kedvencek" />
            <div className="my-2 h-px bg-gray-200" />
            <MenuButton active={section === "jelszo"} onClick={() => setSection("jelszo")} label="Jelszó visszaállítás" />
            <MenuButton active={section === "visszakuldes"} onClick={() => setSection("visszakuldes")} label="Termék visszaküldés" />
            <button
              onClick={logout}
              className="mt-3 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm hover:bg-[var(--pink)] hover:text-white cursor-pointer"
            >
              Kijelentkezés
            </button>
          </nav>
        </aside>
      </div>
    </div>
  );
}


// --- Segéd komponensek ---

function MenuButton({ active, onClick, label }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition cursor-pointer
        ${active ? "bg-[var(--green)]" : "hover:bg-white"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  const id = useMemo(() => label.toLowerCase().replace(/\s+/g, "-"), [label]);
  return (
    <label className="block text-sm mb-3">
      <span className="mb-1 block text-gray-700">{label}</span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/5"
      />
    </label>
  );
}

function AccountForm({ value, onChange, onSave }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Fiókadatok</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Vezetéknév" value={value.vezeteknev} onChange={(v) => onChange({ ...value, vezeteknev: v })} required />
        <Field label="Keresztnév" value={value.keresztnev} onChange={(v) => onChange({ ...value, keresztnev: v })} required />
        <Field label="E-mail" type="email" value={value.email} onChange={(v) => onChange({ ...value, email: v })} required />
        <Field label="Telefon" value={value.telefon || ""} onChange={(v) => onChange({ ...value, telefon: v })} />
      </div>
      <div className="mt-4">
        <button onClick={onSave} className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-black/90">
          Mentés
        </button>
      </div>
    </div>
  );
}

function AddressManager({ addresses, onChange, onSave, onReload }) {
  const [saving, setSaving] = useState(false)

  const add = () => {
    const id = cryptoRandomId();
    onChange([
      ...addresses,
      {
        id,
        _new: true,                 // <- JELÖLÉS, hogy új sor
        nev: "Új cím",
        vezeteknev: "",
        keresztnev: "",
        orszag: "Magyarország",
        irsz: "",
        varos: "",
        utca: "",
        telefon: "",
        default: addresses.length === 0,
      },
    ]);
  };

  const update = (id, patch) =>
    onChange(addresses.map(a => (a.id === id ? { ...a, ...patch } : a)));

  const setDefault = async (id) => {
    try {
      setSaving(true)
      const r = await fetch('/api/account/addresses/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!r.ok) throw new Error('Nem sikerült alapértelmezetté tenni.')
      await onReload() // DB-ből friss lista
    } finally {
      setSaving(false)
    }
  };

  const remove = async (id) => {
    // ha még nem mentett, csak lokálisan dobjuk ki
    const isNew = addresses.find(a => a.id === id)?._new
    if (isNew) {
      onChange(addresses.filter(a => a.id !== id))
      return
    }

    try {
      setSaving(true)
      const r = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('Törlés sikertelen.')
      await onReload()
    } finally {
      setSaving(false)
    }
  };

  const save = async () => {
    try {
      setSaving(true)
      for (const a of addresses) {
        const payload = {
          label: a.nev || 'Cím',
          firstname: a.keresztnev || null,
          lastname: a.vezeteknev || null,
          country: a.orszag || null,
          zip: a.irsz || null,
          city: a.varos || null,
          line1: a.utca || null,
          phone: a.telefon || null,
          is_default: !!a.default, // Ezt igazából a default endpoint kezeli tisztán
        }

        if (a._new) {
          const r = await fetch('/api/account/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (!r.ok) throw new Error('Mentési hiba (új cím).')
        } else {
          const r = await fetch(`/api/account/addresses/${a.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (!r.ok) throw new Error('Mentési hiba (frissítés).')
        }
      }
      await onReload()
      alert('Címek mentve!')
    } finally {
      setSaving(false)
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Címadatok</h2>

      <div className="flex flex-col gap-4">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-200 p-4 opacity-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 justify-between mb-3">
              <input
                className="text-base font-medium w-1/2 border border-[var(--border)] p-2 rounded-lg"
                value={a.nev}
                onChange={(e) => update(a.id, { nev: e.target.value })}
                disabled={saving}
              />
              <div className="flex items-center gap-2">
                {!a.default ? (
                  <button
                    onClick={() => setDefault(a.id)}
                    disabled={saving}
                    className="text-xs rounded-lg px-2 py-1 border border-[var(--green)] hover:bg-[var(--green)] cursor-pointer transition-all"
                    title="Legyen alapértelmezett"
                  >
                    Alapértelmezetté tesz
                  </button>
                ) : (
                  <span className="text-xs rounded-lg bg-green-100 px-2 py-1">Alapértelmezett</span>
                )}
                <button
                  onClick={() => remove(a.id)}
                  disabled={saving}
                  className="text-xs rounded-lg px-2 py-1 bg-[var(--error)] hover:bg-[var(--error-hover)] text-white cursor-pointer transition-all"
                >
                  Törlés
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Vezetéknév" value={a.vezeteknev} onChange={(v) => update(a.id, { vezeteknev: v })} />
              <Field label="Keresztnév" value={a.keresztnev} onChange={(v) => update(a.id, { keresztnev: v })} />
              <Field label="Ország" value={a.orszag} onChange={(v) => update(a.id, { orszag: v })} />
              <Field label="Irányítószám" value={a.irsz} onChange={(v) => update(a.id, { irsz: v })} />
              <Field label="Város" value={a.varos} onChange={(v) => update(a.id, { varos: v })} />
              <Field label="Utca, házszám" value={a.utca} onChange={(v) => update(a.id, { utca: v })} />
              <Field label="Telefon (opcionális)" value={a.telefon || ""} onChange={(v) => update(a.id, { telefon: v })} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={add} disabled={saving} className="rounded-xl px-4 py-2 text-sm bg-[var(--green)] hover:bg-[var(--green-hover)] cursor-pointer">+ Új cím</button>
        <button onClick={save} disabled={saving} className="rounded-xl text-white px-4 py-2 text-sm bg-[var(--pink)] hover:bg-[var(--pink-hover)] cursor-pointer">
          {saving ? 'Mentés…' : 'Címek mentése'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Tipp: a pénztárnál az alapértelmezett cím jelenik meg elsőként, de több címből is választhatsz.
      </p>
    </div>
  );
}

function OrdersView({ orders, onRebuy }) {
  if (!orders.length) return <p>Még nincs rendelésed.</p>;

  console.log(orders)

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
                      const pid = it.product_id ?? it.productId;     // <= itt
                      console.log('rebuy one ->', pid);
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
                  const pid = it.product_id ?? it.productId;   // <= itt
                  console.log('rebuy all ->', pid);
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

function PasswordResetView() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Jelszó visszaállítás</h2>
      <p className="text-sm text-gray-700 mb-4">
        A gombra kattintva átirányítunk a jelszó-visszaállító oldalra.
      </p>
      <Link
        href="/jelszo-visszaallitasa"
        className="inline-block rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
      >
        Jelszó visszaállítása
      </Link>
    </div>
  );
}

function ReturnInfoView() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Termék visszaküldés</h2>
      <p className="text-sm text-gray-700 mb-4">
        Itt találod a visszaküldés feltételeit és a teendőket.
      </p>
      <Link
        href="/visszakuldes"
        className="inline-block rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Visszaküldési információk
      </Link>
    </div>
  );
}

// --- utilok ---
function formatHuf(v) {
  return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(v);
}
function statusLabel(value) {
  switch (value) {
    case "draft":
      return "Piszkozat"
    case "neworder":
      return "Új rendelés"
    case "processing":
      return "Feldolgozás alatt"
    case "pending_payment":
      return "Fizetésre vár"
    case "paid":
      return "Fizetve"
    case "shipped":
      return "Kiszállítva"
    case "delivered":
      return "Futárnak átadva"
    case "cancelled":
      return "Törölve"
    default:
      return value || "Ismeretlen"
  }
}

function statusColor(value) {
  switch (value) {
    case "draft":
      return "bg-gray-200 text-gray-700"
    case "neworder":
      return "bg-[var(--pink)] text-white"
    case "processing":
      return "bg-blue-100 text-blue-700"
    case "pending_payment":
      return "bg-amber-100 text-amber-700"
    case "paid":
      return "bg-emerald-100 text-emerald-700"
    case "shipped":
      return "bg-indigo-100 text-indigo-700"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
