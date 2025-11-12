'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrderFromCart } from '@/app/_actions/order'
import { TbCheck } from "react-icons/tb"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function CheckoutStepper() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [zipLoading, setZipLoading] = useState(false)
  const [dial, setDial] = useState('+36')
  const [touched, setTouched] = useState({}) // hibaszövegekhez

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\+?\d{2,3}[\s]?\d{1,2}[\s]?\d{3}[\s]?\d{3,4}$/;
  const HUNGARIAN_PHONE_REGEX = /^\+36\s?(1|20|21|30|31|50|70|71|72|73|75|76|77|78|79)\s?\d{3}\s?\d{3,4}$/;
  // Általános fallback nemzetközi számokra (+43, +49 stb.)
  const GENERIC_PHONE_REGEX = /^\+\d{2,3}\s?\d{6,12}$/;

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    zip: '',
    city: '',
    address: '',
    address_extra: '',
    notes: '',
    shipping: '',
    payment: ''
  })

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }))
  const markTouched = (k) => setTouched(s => ({ ...s, [k]: true }))

  // --- ZIP autokitöltés
  useEffect(() => {
    const zip = (form.zip || '').replace(/\D/g, '')
    if (zip.length !== 4) { setCityOptions([]); return }

    let stop = false
    ;(async () => {
      try {
        setZipLoading(true)
        const res = await fetch(`/api/zip?zip=${zip}`)
        const json = await res.json()
        if (!stop) {
          setCityOptions(json.cities || [])
          if ((json.cities || []).length === 1) update('city', json.cities[0])
        }
      } finally {
        setZipLoading(false)
      }
    })()
    return () => { stop = true }
  }, [form.zip])

  // --- Telefon formázás
  function formatPhone(local, dial) {
    const digits = (local || '').replace(/\D/g, '')

    if (dial === '+36') {
      if (digits.length <= 2) return digits
      if (digits.length <= 5)
        return `${digits.slice(0, 2)} ${digits.slice(2)}`
      if (digits.length <= 8)
        return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
    }

    // egyéb országkódok: csak csoportosítva, de egyszerűen
    if (digits.length > 4) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    }
    return digits
  }

  // --- VALIDATION szabályok
  const required = {
    1: ['lastname', 'firstname', 'email', 'phone'],
    2: ['shipping'],
    3: ['zip', 'city', 'address'],
  }

  function validateStep(s) {
    const req = required[s] || []
    const invalid = req.filter(f => !form[f]?.trim())

    // alap üres mezők
    if (invalid.length > 0) {
      invalid.forEach(markTouched)
      toast.error('Kérjük, töltsd ki a kötelező mezőket!')
      return false
    }

    // extra regex validálás (email, telefon)
    if (s === 1) {
      if (!EMAIL_REGEX.test(form.email.trim())) {
        markTouched('email')
        toast.error('Kérjük, valós e-mail címet adj meg!')
        return false
      }

      const fullPhone = `${dial} ${form.phone}`.trim()
      const isValidHungarian = dial === '+36' && HUNGARIAN_PHONE_REGEX.test(fullPhone)
      const isValidGeneric = dial !== '+36' && GENERIC_PHONE_REGEX.test(fullPhone)

      if (!isValidHungarian && !isValidGeneric) {
        markTouched('phone')
        toast.error('Kérjük, érvényes telefonszámot adj meg!')
        return false
      }
    }

    return true
  }


  const next = () => {
    if (validateStep(step)) setStep(s => Math.min(4, s + 1))
  }
  const prev = () => setStep(s => Math.max(1, s - 1))

  const submitOrder = async () => {
    if (!validateStep(3)) return
    setPending(true)
    setError('')
    try {
      const fullPhone = `${dial} ${form.phone}`.trim().replace(/\s+/g, ' ')
      const fullName = `${form.lastname} ${form.firstname}`.trim()

      const res = await createOrderFromCart({
        ...form,
        name: fullName, // ha a backend 'name'-et vár
        phone: fullPhone
      })

      if (!res?.ok) throw new Error(res?.message || 'Hiba történt a rendelés leadása során.')
      router.push(`/koszonjuk?order=${res.orderId}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setPending(false)
    }
  }


  // --- SEGÉDFÜGGVÉNY a hibákhoz
  const errorText = (field) => {
    if (!touched[field]) return ''

    const val = form[field]?.trim() || ''
    if (!val) return 'A mező kitöltése kötelező'

    if (field === 'email' && !EMAIL_REGEX.test(val)) {
      return 'Érvénytelen e-mail formátum'
    }

    if (field === 'phone') {
      const full = `${dial} ${form.phone}`.trim()
      const ok = dial === '+36'
        ? HUNGARIAN_PHONE_REGEX.test(full)
        : GENERIC_PHONE_REGEX.test(full)
      if (!ok) return dial === '+36'
        ? 'Érvénytelen magyar telefonszám formátum'
        : 'Érvénytelen telefonszám formátum'
    }

    return ''
  }


  return (
    <div className="lg:w-2/3 w-full mx-auto bg-white rounded-2xl p-6 border border-[var(--border)]">
      {/* progress bar */}
      <div className="flex justify-between mb-6">
        {['Elérhetőség', 'Szállítás', 'Fizetés', 'Összegzés'].map((label, i) => {
          const active = step === i + 1
          const done = step > i + 1
          return (
            <div key={i} className="flex-1 text-center relative">
              <div className={`w-8 h-8 mx-auto mb-2 rounded-full border-2 flex items-center justify-center
                ${done ? 'bg-[var(--green)] border-[var(--green)] text-white'
                  : active ? 'border-[var(--green)] text-[var(--green)]'
                  : 'border-gray-300 text-gray-400'}`}>
                {done ? <TbCheck/> : i + 1}
              </div>
              <div className={`text-sm ${active ? 'font-semibold text-[var(--green)]' : 'text-gray-500'}`}>{label}</div>
              {i < 3 && (
                <div className={`absolute top-4 left-1/2 w-full h-[2px] -translate-x-1/2 z-[-1] 
                  ${done ? 'bg-[var(--green)]' : 'bg-gray-200'}`}></div>
              )}
            </div>
          )
        })}
      </div>

      {/* STEP CONTENT */}
      {step === 1 && (
        <div className="grid gap-3">
          {/* Vezetéknév + Keresztnév */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                className={`input ${errorText('lastname') ? 'border-red-500' : ''} w-full`}
                placeholder="Vezetéknév*"
                value={form.lastname}
                onChange={e => update('lastname', e.target.value)}
                onBlur={() => markTouched('lastname')}
                required
              />
              {errorText('lastname') && <p className="text-red-500 text-xs mt-1">{errorText('lastname')}</p>}
            </div>

            <div>
              <input
                className={`input ${errorText('firstname') ? 'border-red-500' : ''} w-full`}
                placeholder="Keresztnév*"
                value={form.firstname}
                onChange={e => update('firstname', e.target.value)}
                onBlur={() => markTouched('firstname')}
                required
              />
              {errorText('firstname') && <p className="text-red-500 text-xs mt-1">{errorText('firstname')}</p>}
            </div>
          </div>

          <div>
            <input
              className={`input ${errorText('email') ? 'border-red-500' : ''} w-full`}
              type="email"
              placeholder="E-mail*"
              value={form.email}
              onChange={e=>update('email', e.target.value)}
              onBlur={()=>markTouched('email')}
              required
            />
            {errorText('email') && <p className="text-red-500 text-xs mt-1">{errorText('email')}</p>}
          </div>

          {/* Telefon */}
            <div>
              <label className="text-sm font-medium text-gray-700">Telefonszám*</label>
              <div className="grid grid-cols-3 gap-3 mt-1">
                <select
                  className="input min-w-[100px]"
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  aria-label="Országkód"
                >
                  <option value="+36">🇭🇺 +36</option>
                  <option value="+43">🇦🇹 +43</option>
                  <option value="+421">🇸🇰 +421</option>
                  <option value="+40">🇷🇴 +40</option>
                  <option value="+49">🇩🇪 +49</option>
                </select>

                <input
                  className={`input col-span-2 ${errorText('phone') ? 'border-red-500' : ''}`}
                  placeholder={dial === '+36' ? '30 123 4567 vagy 1 234 5678' : 'Telefonszám'}
                  value={form.phone}
                  onChange={(e) => {
                    let raw = e.target.value.replace(/\D/g, '').slice(0, 9)
                    let formatted = raw

                    if (dial === '+36') {
                      // Magyar formázás
                      if (raw.startsWith('1')) {
                        // vezetékes (8 számjegy)
                        if (raw.length <= 1) formatted = raw
                        else if (raw.length <= 4) formatted = `1 ${raw.slice(1)}`
                        else if (raw.length <= 7)
                          formatted = `1 ${raw.slice(1, 4)} ${raw.slice(4)}`
                        else formatted = `1 ${raw.slice(1, 4)} ${raw.slice(4, 8)}`
                      } else {
                        // mobil (9 számjegy)
                        if (raw.length <= 2) formatted = raw
                        else if (raw.length <= 5)
                          formatted = `${raw.slice(0, 2)} ${raw.slice(2)}`
                        else if (raw.length <= 8)
                          formatted = `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5)}`
                        else formatted = `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5, 9)}`
                      }
                    } else {
                      // Külföldi számoknál csak alap csoportosítás
                      if (raw.length > 3)
                        formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
                    }

                    update('phone', formatted.trim())
                  }}
                  onBlur={() => markTouched('phone')}
                  inputMode="tel"
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Teljes szám: <span className="font-medium">{`${dial} ${form.phone}`}</span>
              </p>

              {errorText('phone') && (
                <p className="text-red-500 text-xs mt-1">{errorText('phone')}</p>
              )}
            </div>

          </div>
      )}

      {step === 2 && (
        <div className="grid gap-3">
          {[
            { id: 'gls', name: 'Prémium házhozszállítás (GLS)', price: '1499 Ft' },
            { id: 'foxpost', name: 'FOXPOST csomagautomata', price: '999 Ft' },
          ].map(opt => (
            <label key={opt.id} className={`border rounded-xl p-3 flex justify-between cursor-pointer 
              ${form.shipping === opt.id ? 'border-[var(--pink)] bg-pink-50' : 'border-gray-200'}`}>
              <div>{opt.name}</div>
              <div className="font-semibold">{opt.price}</div>
              <input type="radio" name="shipping" value={opt.id} checked={form.shipping===opt.id} onChange={e=>update('shipping', e.target.value)} className="hidden" />
            </label>
          ))}
          {errorText('shipping') && <p className="text-red-500 text-xs mt-1">{errorText('shipping')}</p>}
        </div>
      )}

      {step === 3 && (
        <div className='flex flex-col gap-3'>
          <h3 className="font-semibold text-gray-700 mt-4">Számlázási cím</h3>
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-3 w-full">
            <div className='w-full'>
              <input
                className={`input ${errorText('zip') ? 'border-red-500' : ''} w-full`}
                placeholder="Irányítószám"
                value={form.zip}
                onChange={e=>update('zip', e.target.value.replace(/\D/g, '').slice(0,4))}
                inputMode="numeric"
                onBlur={()=>markTouched('zip')}
              />
              {errorText('zip') && <p className="text-red-500 text-xs mt-1">{errorText('zip')}</p>}
            </div>

            {cityOptions.length > 0 ? (
              <select
                className={`input col-span-2 ${errorText('city') ? 'border-red-500' : ''} w-full`}
                value={form.city}
                onChange={e=>update('city', e.target.value)}
                disabled={zipLoading}
                onBlur={()=>markTouched('city')}
              >
                <option value="">{zipLoading ? 'Települések betöltése…' : 'Válassz várost'}</option>
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                className={`input col-span-2 ${errorText('city') ? 'border-red-500' : ''}`}
                placeholder={zipLoading ? 'Betöltés…' : 'Város'}
                value={form.city}
                onChange={e=>update('city', e.target.value)}
                onBlur={()=>markTouched('city')}
                disabled={zipLoading}
              />
            )}
            {errorText('city') && <p className="text-red-500 text-xs mt-1 col-span-3">{errorText('city')}</p>}
          </div>

          <div>
            <input
              className={`input ${errorText('address') ? 'border-red-500' : ''} w-full`}
              placeholder="Cím (utca, házszám)"
              value={form.address}
              onChange={e=>update('address', e.target.value)}
              onBlur={()=>markTouched('address')}
            />
            {errorText('address') && <p className="text-red-500 text-xs mt-1">{errorText('address')}</p>}
          </div>

          <div>
            <input
              className="input w-full"
              placeholder="Emelet, ajtó (opcionális)"
              value={form.address_extra}
              onChange={e => update('address_extra', e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-sm text-gray-700">
          <p><strong>Név:</strong> {form.lastname} {form.firstname}</p>
          <p><strong>E-mail:</strong> {form.email}</p>
          <p><strong>Telefon:</strong> {`${dial} ${form.phone}`}</p>
          <p><strong>Szállítás:</strong> {form.shipping}</p>
          <p><strong>Cím:</strong> {form.zip} {form.city}, {form.address} {form.address_extra && `, ${form.address_extra}`}</p>
          <textarea
            className="input mt-3 w-full"
            placeholder="Megjegyzés"
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            rows={3}
          />
        </div>
      )}

      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        {step > 1 ? (
          <button type="button" onClick={prev} className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100">Vissza</button>
        ) : <div></div>}
        {step < 4 ? (
          <button type="button" onClick={next} className="px-6 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90">Tovább</button>
        ) : (
          <button
            type="button"
            onClick={submitOrder}
            disabled={pending}
            className="px-6 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Feldolgozás…' : 'Megrendelés'}
          </button>
        )}
      </div>

      <style jsx>{`
        .input {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          outline: none;
        }
        .input:focus {
          box-shadow: 0 0 0 3px rgba(255, 0, 150, 0.15);
        }
      `}</style>
    </div>
  )
}
