"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addToCart as addToCartAction } from '@/app/_actions/cart'
import H2 from "@/app/components/UI/Texts/H2";

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
        email:      fresh.email || "",
        telefon:    fresh.phone || "",
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
    window.location.href = "/bejelentkezes";
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Betöltés...</div>;

  return (
    <div className="flex flex-col gap-8 w-full xl:py-28 py-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <H2 className="text-2xl font-semibold mb-4">Fiók</H2>
      <div className="mx-auto w-full flex flex-col lg:flex-row-reverse gap-6">
        {/* Tartalom */}
        <main className="lg:w-2/3 w-full">
          <div className="rounded-2xl border border-[var(--border)] p-4 lg:p-6 ">
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
        <aside className="lg:w-1/3 lg:max-w-sm w-full">
          <nav className="rounded-2xl bg-[var(--grey-bg)] p-3 space-y-2">
            <MenuButton active={section === "fiokadatok"} onClick={() => setSection("fiokadatok")} label="Fiókadatok" />
            <MenuButton active={section === "cimek"} onClick={() => setSection("cimek")} label="Címadatok" />
            <MenuButton active={section === "rendelesek"} onClick={() => setSection("rendelesek")} label="Korábbi rendelések" />
            <MenuButton active={section === "kedvencek"} onClick={() => setSection("kedvencek")} label="Kedvencek" />
            <div className="my-2 h-px bg-gray-200" />
            <MenuButton active={section === "jelszo"} onClick={() => setSection("jelszo")} label="Jelszó visszaállítás" />
            <MenuButton active={section === "visszakuldes"} onClick={() => setSection("visszakuldes")} label="Termék visszaküldés" />
            <button
              onClick={logout}
              className="mt-3 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm hover:bg-[var(--pink)] hover:text-white"
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
      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition
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
        headers: { 'Content-Type':'application/json' },
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
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify(payload)
          })
          if (!r.ok) throw new Error('Mentési hiba (új cím).')
        } else {
          const r = await fetch(`/api/account/addresses/${a.id}`, {
            method: 'PUT',
            headers: { 'Content-Type':'application/json' },
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
            <div className="flex items-center justify-between mb-3">
              <input
                className="text-base font-medium border-none outline-none w-1/2"
                value={a.nev}
                onChange={(e) => update(a.id, { nev: e.target.value })}
                disabled={saving}
              />
              <div className="flex items-center gap-2">
                {!a.default ? (
                  <button
                    onClick={() => setDefault(a.id)}
                    disabled={saving}
                    className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
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
                  className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
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
        <button onClick={add} disabled={saving} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">+ Új cím</button>
        <button onClick={save} disabled={saving} className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-black/90">
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

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Korábbi rendelések</h2>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-sm">
                <div className="font-medium">Rendelés {o.number}</div>
                <div className="text-gray-600">
                  {new Date(o.created_at).toLocaleString()} · {formatHuf(o.total)} · {statusLabel(o.status)}
                </div>
              </div>
                <button
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                    onClick={async () => {
                      for (const it of o.items) {
                        const pid = it.product_id ?? it.productId;   // <= itt
                        console.log('rebuy all ->', pid);
                        await onRebuy(pid, it.qty);
                      }
                    }}
                  >
                    Újravásárlás (összes)
                  </button>
            </div>

            <ul className="divide-y">
              {o.items.map((it) => (
                <li key={it.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{it.name}</div>
                    <div className="text-xs text-gray-600">
                      {it.qty} × {formatHuf(it.unit_price)}
                    </div>
                  </div>
                  <button
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 shrink-0"
                    onClick={() => {
                      const pid = it.product_id ?? it.productId;     // <= itt
                      console.log('rebuy one ->', pid);
                      onRebuy(pid, it.qty);
                    }}
                  >
                    Kosárba újra
                  </button>
                </li>
              ))}
            </ul>
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {favorites.map((p) => (
          <div key={p.id} className="rounded-xl border border-gray-200 p-3">
            <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</div>
            <div className="text-sm text-gray-700 mt-1">{formatHuf(p.price)}</div>
            <button
              onClick={() => onAddToCart(p.id)}
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Kosárba
            </button>
          </div>
        ))}
      </div>
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
function statusLabel(s) {
  return (
    {
      paid: "Fizetve",
      shipped: "Feladva",
      delivered: "Kézbesítve",
      cancelled: "Törölve",
      processing: "Feldolgozás alatt",
    }[s] || s
  );
}
function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
