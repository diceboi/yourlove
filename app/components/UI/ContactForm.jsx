'use client'

import { useActionState, useEffect, useState } from 'react'
import { sendContact } from '@/app/_actions/contact'

const initialState = { ok: false, message: '' }

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContact, initialState)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    // siker esetén újramountoljuk a formot -> kiürül
    if (state?.ok && !state?.spam) setFormKey(k => k + 1)
  }, [state])

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-3">
      {/* honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Név</span>
        <input name="name" required className="border border-[var(--border)] rounded-lg p-3 outline-none focus:ring" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">E-mail cím</span>
        <input type="email" name="email" required className="border border-[var(--border)] rounded-lg p-3 outline-none focus:ring" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Üzenet</span>
        <textarea name="message" required rows={6} className="border border-[var(--border)] rounded-lg p-3 outline-none focus:ring" />
      </label>

      <button
        disabled={pending}
        className="px-5 py-3 rounded-xl bg-[var(--pink)] text-white disabled:opacity-60"
      >
        {pending ? 'Küldés...' : 'Üzenet küldése'}
      </button>

      {state?.message ? (
        <p className={`text-sm ${state.ok ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>
      ) : null}
    </form>
  )
}
