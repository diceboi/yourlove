'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrderFromCart } from '@/app/_actions/order'

export default function CheckoutForm() {
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    zip: '',
    city: '',
    address: '',
    notes: ''
  })

  function update(k, v) {
    setForm(s => ({ ...s, [k]: v }))
  }

  function onSubmit(e) {
    e.preventDefault()
    setErr('')
    start(async () => {
      const res = await createOrderFromCart(form)
      if (!res?.ok) { setErr(res?.message || 'Hiba történt'); return }
      // TODO: SimplePay tranzakció indítása itt
      router.push(`/koszonjuk?order=${res.orderId}`)
    })
  }

  return (
    <form onSubmit={onSubmit} className="border border-[var(--border)] rounded-lg p-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">Számlázási adatok</h2>

      <div className="grid grid-cols-1 gap-3">
        <input className="input" placeholder="Név*" value={form.name} onChange={e=>update('name', e.target.value)} required />
        <input className="input" type="email" placeholder="Email*" value={form.email} onChange={e=>update('email', e.target.value)} required />
        <input className="input" placeholder="Telefon" value={form.phone} onChange={e=>update('phone', e.target.value)} />

        <div className="grid grid-cols-3 gap-3">
          <input className="input" placeholder="Irányítószám" value={form.zip} onChange={e=>update('zip', e.target.value)} />
          <input className="input col-span-2" placeholder="Város" value={form.city} onChange={e=>update('city', e.target.value)} />
        </div>
        <input className="input" placeholder="Cím" value={form.address} onChange={e=>update('address', e.target.value)} />
        <textarea className="input" placeholder="Megjegyzés" value={form.notes} onChange={e=>update('notes', e.target.value)} rows={3} />

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 px-5 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Feldolgozás…' : 'Megrendelés leadása'}
        </button>
      </div>

      <style jsx>{`
        .input {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          outline: none;
        }
        .input:focus { box-shadow: 0 0 0 3px rgba(255, 0, 150, 0.15) }
      `}</style>
    </form>
  )
}
