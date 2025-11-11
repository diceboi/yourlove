"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// --- MOCK / HELPER FÜGGVÉNYEK: cseréld saját API-kra ---
async function saveAccount(data) {
  console.log("saveAccount", data);
}
async function addToCart(productId, qty = 1) {
  console.log("addToCart", { productId, qty });
  window.dispatchEvent(new Event("cart:changed"));
}
async function saveAddresses(addresses) {
  console.log("saveAddresses", addresses);
}
async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/bejelentkezes";
}

// --- OLDAL ---
export default function AccountPage() {
  const [section, setSection] = useState("fiokadatok");

  // kezdeti mock adatok – töltsd be a valósat SSR-ből vagy fetch-csel
  const [profile, setProfile] = useState({
    vezeteknev: "Kiss",
    keresztnev: "Anna",
    email: "anna@example.com",
    telefon: "+36 30 123 4567",
  });

  const [addresses, setAddresses] = useState([
    {
      id: "addr1",
      nev: "Otthon",
      vezeteknev: "Kiss",
      keresztnev: "Anna",
      orszag: "Magyarország",
      irsz: "7400",
      varos: "Kaposvár",
      utca: "Szondi u. 22. 4/15",
      telefon: "+36 30 123 4567",
      default: true,
    },
  ]);

  const [orders] = useState([
    {
      id: "ord1",
      number: "R-2025-000123",
      created_at: "2025-02-08T10:12:00Z",
      total: 34990,
      status: "delivered",
      items: [
        { id: "it1", productId: "p123", name: "Termék A", qty: 1, unit_price: 19990 },
        { id: "it2", productId: "p456", name: "Termék B", qty: 1, unit_price: 15000 },
      ],
    },
  ]);

  const [favorites] = useState([
    { id: "p789", name: "Kedvenc termék C", price: 12990 },
    { id: "p321", name: "Kedvenc termék D", price: 9900 },
  ]);

  return (
    <div className="w-full xl:pt-18 pt-16 xl:pb-8 pb-6 px-4 xl:px-12">
      {/* lg: jobb oldali sáv → flex-row-reverse */}
      <div className="mx-auto w-full flex flex-col lg:flex-row-reverse gap-6">
        {/* Sidebar – JOBB OLDALT 1/3 */}
        <aside className="lg:w-1/3 lg:max-w-sm w-full">
          <nav className="rounded-2xl bg-[var(--grey-bg,#f6f7f8)] p-3 shadow-sm">
            <MenuButton active={section === "fiokadatok"} onClick={() => setSection("fiokadatok")} label="Fiókadatok" />
            <MenuButton active={section === "cimek"} onClick={() => setSection("cimek")} label="Címadatok" />
            <MenuButton active={section === "rendelesek"} onClick={() => setSection("rendelesek")} label="Korábbi rendelések" />
            <MenuButton active={section === "kedvencek"} onClick={() => setSection("kedvencek")} label="Kedvencek" />
            <div className="my-2 h-px bg-gray-200" />
            <MenuButton active={section === "jelszo"} onClick={() => setSection("jelszo")} label="Jelszó visszaállítás" />
            <MenuButton active={section === "visszakuldes"} onClick={() => setSection("visszakuldes")} label="Termék visszaküldés" />
            <button
              onClick={logout}
              className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              Kijelentkezés
            </button>
          </nav>
        </aside>

        {/* Tartalom – BAL OLDALT 2/3 */}
        <main className="lg:w-2/3 w-full">
          <div className="rounded-2xl border border-gray-100 p-4 lg:p-6 shadow-sm">
            {section === "fiokadatok" && (
              <AccountForm
                value={profile}
                onChange={setProfile}
                onSave={async () => { await saveAccount(profile); }}
              />
            )}

            {section === "cimek" && (
              <AddressManager
                addresses={addresses}
                onChange={setAddresses}
                onSave={async (addrs) => { await saveAddresses(addrs); }}
              />
            )}

            {section === "rendelesek" && (
              <OrdersView
                orders={orders}
                onRebuy={async (productId, qty) => { await addToCart(productId, qty); }}
              />
            )}

            {section === "kedvencek" && (
              <FavoritesView
                favorites={favorites}
                onAddToCart={async (productId) => { await addToCart(productId, 1); }}
              />
            )}

            {section === "jelszo" && <PasswordResetView />}

            {section === "visszakuldes" && <ReturnInfoView />}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Segéd komponensek ---

function MenuButton({ active, onClick, label }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition
        ${active ? "bg-white shadow border border-gray-200" : "hover:bg-white"}`}
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

function AddressManager({ addresses, onChange, onSave }) {
  const add = () => {
    const id = cryptoRandomId();
    onChange([
      ...addresses,
      {
        id,
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

  const setDefault = (id) => onChange(addresses.map(a => ({ ...a, default: a.id === id })));
  const update = (id, patch) => onChange(addresses.map(a => (a.id === id ? { ...a, ...patch } : a)));
  const remove = (id) => {
    const filtered = addresses.filter(a => a.id !== id);
    if (!filtered.some(a => a.default) && filtered[0]) filtered[0].default = true;
    onChange(filtered);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Címadatok</h2>
      <div className="flex flex-col gap-4">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                className="text-base font-medium border-none outline-none w-1/2"
                value={a.nev}
                onChange={(e) => update(a.id, { nev: e.target.value })}
              />
              <div className="flex items-center gap-2">
                {!a.default ? (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
                    title="Legyen alapértelmezett"
                  >
                    Alapértelmezetté tesz
                  </button>
                ) : (
                  <span className="text-xs rounded-lg bg-green-100 px-2 py-1">Alapértelmezett</span>
                )}
                <button onClick={() => remove(a.id)} className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50">
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
        <button onClick={add} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">+ Új cím</button>
        <button onClick={() => onSave(addresses)} className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-black/90">
          Címek mentése
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
                  for (const it of o.items) await onRebuy(it.productId, it.qty);
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
                    onClick={() => onRebuy(it.productId, it.qty)}
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
