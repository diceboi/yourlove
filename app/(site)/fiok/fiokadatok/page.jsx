"use client";

import { useState, useEffect, useMemo } from "react";
import AccountPageSkeleton from "@/app/components/UI/AccountPageSkeleton";
import { toast } from "react-toastify";

export default function AccountDataPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/account', { cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          const p = await res.json();
          setProfile({
            vezeteknev: p.lastname || "",
            keresztnev: p.firstname || "",
            email: p.email || "",
            telefon: p.phone || "",
          });
        } else {
          setProfile({ vezeteknev: "", keresztnev: "", email: "", telefon: "" });
        }
      } catch (err) {
        console.error("loadData error:", err);
        setProfile({ vezeteknev: "", keresztnev: "", email: "", telefon: "" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function saveAccount(data) {
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: data.keresztnev,
          lastname: data.vezeteknev,
          phone: data.telefon,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        toast.error(`Nem sikerült menteni a fiókadatokat. ${payload?.error || ""}`);
        return;
      }

      // Refetch to confirm update
      const freshRes = await fetch('/api/account', { cache: 'no-store' });
      if (freshRes.ok) {
        const fresh = await freshRes.json();
        setProfile({
          vezeteknev: fresh.lastname || "",
          keresztnev: fresh.firstname || "",
          email: fresh.email || "",
          telefon: fresh.phone || "",
        });
      }
      toast.success("Adatok sikeresen mentve!");
    } catch (error) {
       toast.error("Hiba történt a mentés során.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AccountPageSkeleton />;

  return profile ? (
    <AccountForm value={profile} onChange={setProfile} onSave={() => saveAccount(profile)} saving={saving} />
  ) : (
    <p className="text-gray-500 text-sm">Betöltés...</p>
  );
}

function AccountForm({ value, onChange, onSave, saving }) {
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
        <button 
          onClick={onSave} 
          disabled={saving}
          className="rounded-xl text-white px-4 py-2 text-sm bg-[var(--pink)] hover:bg-[var(--pink-hover)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? 'Mentés...' : 'Mentés'}
        </button>
      </div>
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
