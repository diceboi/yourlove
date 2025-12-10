"use client";

import { useState, useEffect, useMemo } from "react";
import AccountPageSkeleton from "@/app/components/UI/AccountPageSkeleton";
import { toast } from "react-toastify";

export default function AddressPage() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  async function reloadAddresses() {
    try {
      const res = await fetch('/api/account/addresses', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        setAddresses(await res.json());
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("loadAddresses error:", err);
      setAddresses([]);
    }
  }

  useEffect(() => {
    reloadAddresses().finally(() => setLoading(false));
  }, []);

  if (loading) return <AccountPageSkeleton />;

  return (
    <AddressManager
      addresses={addresses}
      onChange={setAddresses}
      onReload={reloadAddresses}
    />
  );
}

function AddressManager({ addresses, onChange, onReload }) {
  const [saving, setSaving] = useState(false);

  const add = () => {
    const id = cryptoRandomId();
    onChange([
      ...addresses,
      {
        id,
        _new: true,
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
      setSaving(true);
      const r = await fetch('/api/account/addresses/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!r.ok) throw new Error('Nem sikerült alapértelmezetté tenni.');
      await onReload();
      toast.success("Alapértelmezett cím sikeresen módosítva!");
    } catch (error) {
       toast.error("Nem sikerült alapértelmezetté tenni.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const isNew = addresses.find(a => a.id === id)?._new;
    if (isNew) {
      onChange(addresses.filter(a => a.id !== id));
      return;
    }

    try {
      setSaving(true);
      const r = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Törlés sikertelen.');
      await onReload();
      toast.success("Cím sikeresen törölve!");
    } catch (error) {
       toast.error("Nem sikerült törölni a címet.");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
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
          is_default: !!a.default,
        };

        if (a._new) {
          const r = await fetch('/api/account/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!r.ok) throw new Error('Mentési hiba (új cím).');
        } else {
          const r = await fetch(`/api/account/addresses/${a.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!r.ok) throw new Error('Mentési hiba (frissítés).');
        }
      }
      await onReload();
      toast.success("Címek sikeresen mentve!");
    } catch (error) {
      toast.error("Hiba történt a mentés során.");
    } finally {
      setSaving(false);
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

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
