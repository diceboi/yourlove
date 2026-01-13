// app/components/checkout/CheckoutForm.jsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrderFromCart } from '@/app/_actions/order'
import { TbCheck } from "react-icons/tb"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function CheckoutStepper({ initialProfile, savedAddresses = [], defaultAddress }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [zipLoading, setZipLoading] = useState(false)
  const [dial, setDial] = useState('+36')
  const [touched, setTouched] = useState({})

  // Kupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // Pontbeváltás state
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [pointsDiscount, setPointsDiscount] = useState(0)

  // számlázási cím állapot
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [saveShippingAddress, setSaveShippingAddress] = useState(false)

  // Áfás számla állapot
  const [wantsInvoice, setWantsInvoice] = useState(false)

  // MENTETT CÍM VÁLASZTÁS: id vagy 'custom'
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || 'custom')

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const HUNGARIAN_PHONE_REGEX = /^\+36\s?(1|20|21|30|31|50|70|71|72|73|75|76|77|78|79)\s?\d{3}\s?\d{3,4}$/
  const GENERIC_PHONE_REGEX = /^\+\d{2,3}\s?\d{6,12}$/
  const HUNGARIAN_TAX_REGEX = /^\d{8}-\d-\d{2}$/

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    zip: '',
    city: '',
    address: '',
    address_extra: '',
    billing_zip: '',
    billing_city: '',
    billing_address: '',
    billing_address_extra: '',
    notes: '',
    shipping: '',
    payment: '',
    company_name: '',          // ÚJ
    company_tax_number: '',    // ÚJ
  })


  const update = (k, v) => setForm(s => ({ ...s, [k]: v }))
  const markTouched = (k) => setTouched(s => ({ ...s, [k]: true }))

  // Kupon alkalmazása
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Kérlek add meg a kupon kódot')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      // Calculate current order total (termékek + szállítás)
      // TODO: Ez egy egyszerűsített verzió, a tényleges kosár érték kellene
      const orderTotal = 10000 // Placeholder - a tényleges kosár összegét be kell szerezni
      const shippingCost = form.shipping === 'gls' ? 1499 : 999

      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          orderTotal,
          shippingCost
        }),
      })

      const data = await res.json()

      if (data.ok) {
        setAppliedCoupon(data)
        setCouponError('')

        // Store in localStorage for Summary component
        localStorage.setItem('appliedCoupon', JSON.stringify(data))

        // Emit event for Summary component
        window.dispatchEvent(new CustomEvent('couponApplied', { detail: data }))

        toast.success(`Kupon sikeresen alkalmazva!`)
      } else {
        setCouponError(data.message || 'Érvénytelen kuponkód')
        setAppliedCoupon(null)
      }
    } catch (error) {
      setCouponError('Hiba történt a kupon ellenőrzése során')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponError('')
    localStorage.removeItem('appliedCoupon')
    window.dispatchEvent(new Event('couponRemoved'))
  }

  // --- Telefonszám parse a DB-ből (06, +36, stb. levágás) ---
  function parsePhoneFromDB(phone) {
    if (!phone) return { dial: '+36', local: '' }
    let raw = phone.trim()
    const clean = raw.replace(/[^+\d]/g, '')

    if (clean.startsWith('+36')) return { dial: '+36', local: clean.slice(3) }
    if (clean.startsWith('0036')) return { dial: '+36', local: clean.slice(4) }
    if (clean.startsWith('06')) return { dial: '+36', local: clean.slice(2) }
    if (clean.startsWith('36') && clean.length >= 10) return { dial: '+36', local: clean.slice(2) }

    if (clean.startsWith('+')) {
      const match = clean.match(/^(\+\d{2,3})(\d*)$/)
      if (match) return { dial: match[1], local: match[2] || '' }
    }
    return { dial: '+36', local: clean }
  }

  // --- PREFILL: user_profiles ---
  useEffect(() => {
    if (!initialProfile) return
    const { firstname, lastname, email, phone } = initialProfile
    const ph = parsePhoneFromDB(phone)

    setDial(ph.dial)
    setForm(s => ({
      ...s,
      firstname: firstname || '',
      lastname: lastname || '',
      email: email || '',
      phone: ph.local || '',
    }))
  }, [initialProfile])

  // --- PREFILL: defaultAddress szállítási cím + selectedAddressId inicializálás ---
  useEffect(() => {
    if (!defaultAddress) return
    setSelectedAddressId(defaultAddress.id)
    setForm(s => ({
      ...s,
      zip: s.zip || defaultAddress.zip || '',
      city: s.city || defaultAddress.city || '',
      address: s.address || defaultAddress.line1 || '',
      // address_extra marad, mert a line1-ben lehet minden
    }))
  }, [defaultAddress])

  // --- PONTBEVÁLTÁS EVENT LISTENER ---
  useEffect(() => {
    const handlePointsRedemption = (e) => {
      setPointsToRedeem(e.detail.pointsToRedeem || 0)
      setPointsDiscount(e.detail.discountAmount || 0)
    }

    const handlePointsRedemptionRemoved = () => {
      setPointsToRedeem(0)
      setPointsDiscount(0)
    }

    window.addEventListener('pointsRedemption', handlePointsRedemption)
    window.addEventListener('pointsRedemptionRemoved', handlePointsRedemptionRemoved)

    return () => {
      window.removeEventListener('pointsRedemption', handlePointsRedemption)
      window.removeEventListener('pointsRedemptionRemoved', handlePointsRedemptionRemoved)
    }
  }, [])

  // --- ZIP autokitöltés ---
  useEffect(() => {
    const zip = (form.zip || '').replace(/\D/g, '')
    if (zip.length !== 4) { setCityOptions([]); return }

    let stop = false
      ; (async () => {
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

  // --- cím normalizálás + összehasonlítás mentett címekkel ---
  function normalizeAddress(addr) {
    if (!addr) return ''
    const parts = [
      addr.zip,
      addr.city,
      addr.address,
      addr.address_extra,
    ]
      .map(x => (x || '').trim().toLowerCase())
      .filter(Boolean)
    return parts.join('|')
  }

  const hasMatchingSavedAddress = useMemo(() => {
    if (!savedAddresses || !savedAddresses.length) return false
    const current = {
      zip: form.zip,
      city: form.city,
      address: form.address,
      address_extra: form.address_extra,
    }
    const normCurrent = normalizeAddress(current)
    if (!normCurrent) return false
    return savedAddresses.some(a =>
      normalizeAddress({
        zip: a.zip,
        city: a.city,
        address: a.line1,
        address_extra: '',
      }) === normCurrent
    )
  }, [savedAddresses, form.zip, form.city, form.address, form.address_extra])

  // ha már létező cím, ne legyen bekapcsolva a mentés
  useEffect(() => {
    if (hasMatchingSavedAddress && saveShippingAddress) {
      setSaveShippingAddress(false)
    }
  }, [hasMatchingSavedAddress, saveShippingAddress])

  // --- MENTETT CÍM VÁLASZTÓ LOGIKA ---
  function applySavedAddress(addr) {
    if (!addr) return
    setForm(s => ({
      ...s,
      zip: addr.zip || '',
      city: addr.city || '',
      address: addr.line1 || '',
      address_extra: '',
    }))
  }

  function handleSelectAddress(id) {
    setSelectedAddressId(id)
    const addr = savedAddresses.find(a => a.id === id)
    if (addr) {
      applySavedAddress(addr)
    }
  }

  // --- VALIDATION ---
  function validateStep(s) {
    let requiredFields = []
    if (s === 1) {
      requiredFields = ['lastname', 'firstname', 'email', 'phone']
    } else if (s === 2) {
      requiredFields = ['shipping']
    } else if (s === 3) {
      if (billingSameAsShipping) {
        requiredFields = ['zip', 'city', 'address']
      } else {
        requiredFields = ['zip', 'city', 'address', 'billing_zip', 'billing_city', 'billing_address']
      }

      // ha áfás számlát kér, kötelező a cégnév + adószám
      if (wantsInvoice) {
        requiredFields.push('company_name', 'company_tax_number')
      }
    }

    const invalid = requiredFields.filter(f => !form[f]?.trim())
    if (invalid.length > 0) {
      invalid.forEach(markTouched)
      toast.error('Kérjük, töltsd ki a kötelező mezőket!')
      return false
    }

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
        name: fullName,
        phone: fullPhone,
        billingDifferent: !billingSameAsShipping,
        saveShippingAddress,
        wantsInvoice,
        // Kupon adatok
        couponCode: appliedCoupon ? couponCode : null,
        couponData: appliedCoupon || null,
        // Pontbeváltás adatok
        pointsToRedeem: pointsToRedeem || 0,
        pointsDiscount: pointsDiscount || 0,
      })

      if (!res?.ok) throw new Error(res?.message || 'Hiba történt a rendelés leadása során.')
      router.push(`/koszonjuk?order=${res.orderId}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setPending(false)
    }
  }

  const errorText = (field) => {
    if (!touched[field]) return ''

    const val = form[field]?.trim() || ''

    const alwaysRequired = ['lastname', 'firstname', 'email', 'phone', 'shipping']
    const shippingRequired = ['zip', 'city', 'address']
    const billingRequired = ['billing_zip', 'billing_city', 'billing_address']
    const invoiceRequired = ['company_name', 'company_tax_number']

    const isBillingField = billingRequired.includes(field)
    const isRequired =
      alwaysRequired.includes(field) ||
      shippingRequired.includes(field) ||
      (!billingSameAsShipping && isBillingField)

    if (!val && isRequired) return 'A mező kitöltése kötelező'

    if (field === 'email' && val && !EMAIL_REGEX.test(val)) {
      return 'Érvénytelen e-mail formátum'
    }

    if (field === 'phone') {
      const full = `${dial} ${form.phone}`.trim()
      const ok = dial === '+36'
        ? HUNGARIAN_PHONE_REGEX.test(full)
        : GENERIC_PHONE_REGEX.test(full)
      if (!ok) {
        return dial === '+36'
          ? 'Érvénytelen magyar telefonszám formátum'
          : 'Érvénytelen telefonszám formátum'
      }
    }

    if (field === 'company_tax_number' && val && !HUNGARIAN_TAX_REGEX.test(val)) {
      return 'Érvénytelen adószám formátum (pl. 12345678-1-12)'
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
                {done ? <TbCheck /> : i + 1}
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

      {/* STEP 1 – ELÉRHETŐSÉG */}
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
              onChange={e => update('email', e.target.value)}
              onBlur={() => markTouched('email')}
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
                    if (raw.startsWith('1')) {
                      if (raw.length <= 1) formatted = raw
                      else if (raw.length <= 4) formatted = `1 ${raw.slice(1)}`
                      else if (raw.length <= 7)
                        formatted = `1 ${raw.slice(1, 4)} ${raw.slice(4)}`
                      else formatted = `1 ${raw.slice(1, 4)} ${raw.slice(4, 8)}`
                    } else {
                      if (raw.length <= 2) formatted = raw
                      else if (raw.length <= 5)
                        formatted = `${raw.slice(0, 2)} ${raw.slice(2)}`
                      else if (raw.length <= 8)
                        formatted = `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5)}`
                      else formatted = `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5, 9)}`
                    }
                  } else {
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

      {/* STEP 2 – SZÁLLÍTÁS */}
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
              <input type="radio" name="shipping" value={opt.id} checked={form.shipping === opt.id} onChange={e => update('shipping', e.target.value)} className="hidden" />
            </label>
          ))}
          {errorText('shipping') && <p className="text-red-500 text-xs mt-1">{errorText('shipping')}</p>}

          {/* Kupon mező */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Kuponkód</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <TbCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-mono font-semibold text-green-900">{couponCode}</p>
                    <p className="text-xs text-green-700">Kupon alkalmazva</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eltávolítás
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="input flex-1"
                    placeholder="Add meg a kuponkódot"
                    disabled={couponLoading}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-[var(--pink)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? 'Ellenőrzés...' : 'Alkalmazás'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-600 text-sm">{couponError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3 – CÍMEK + MENTETT CÍM VÁLASZTÁS */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-gray-700 mt-1">Szállítási cím</h3>

          {/* Mentett cím választó */}
          {savedAddresses.length > 0 && (
            <div className="mb-2 space-y-2">
              <p className="text-sm font-medium text-gray-800">Mentett címeid</p>
              <div className="space-y-1">
                {savedAddresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer text-sm
                      ${selectedAddressId === addr.id ? 'border-[var(--pink)] bg-pink-50' : 'border-[var(--border)]'}`}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      className="mt-1"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => handleSelectAddress(addr.id)}
                    />
                    <div>
                      <div className="font-semibold">
                        {addr.label || 'Mentett cím'}
                      </div>
                      <div className="text-xs text-[var(--tertiary-text)]">
                        {addr.zip} {addr.city}, {addr.line1}
                      </div>
                    </div>
                  </label>
                ))}

                {/* Új cím opció */}
                <label
                  className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer text-sm
                    ${selectedAddressId === 'custom' ? 'border-[var(--pink)] bg-pink-50' : 'border-[var(--border)]'}`}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    className=""
                    value="custom"
                    checked={selectedAddressId === 'custom'}
                    onChange={() => setSelectedAddressId('custom')}
                  />
                  <span>Másik cím megadása</span>
                </label>
              </div>
            </div>
          )}

          {/* Szállítási cím mezők */}
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-3 w-full">
            <div className='w-full'>
              <input
                className={`input ${errorText('zip') ? 'border-red-500' : ''} w-full`}
                placeholder="Irányítószám"
                value={form.zip}
                onChange={e => update('zip', e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                onBlur={() => markTouched('zip')}
              />
              {errorText('zip') && <p className="text-red-500 text-xs mt-1">{errorText('zip')}</p>}
            </div>

            {cityOptions.length > 0 ? (
              <select
                className={`input col-span-2 ${errorText('city') ? 'border-red-500' : ''} w-full`}
                value={form.city}
                onChange={e => update('city', e.target.value)}
                disabled={zipLoading}
                onBlur={() => markTouched('city')}
              >
                <option value="">{zipLoading ? 'Települések betöltése…' : 'Válassz várost'}</option>
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                className={`input col-span-2 ${errorText('city') ? 'border-red-500' : ''}`}
                placeholder={zipLoading ? 'Betöltés…' : 'Város'}
                value={form.city}
                onChange={e => update('city', e.target.value)}
                onBlur={() => markTouched('city')}
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
              onChange={e => update('address', e.target.value)}
              onBlur={() => markTouched('address')}
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

          {/* ÁFÁS SZÁMLA KÉRÉSE */}
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={wantsInvoice}
                onChange={e => setWantsInvoice(e.target.checked)}
              />
              <span>Áfás számlát kérek cég részére</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Ha céges számlát szeretnél, add meg a cégnevét és adószámát. A számlázási cím a fenti
              mezők alapján kerül kiállításra.
            </p>

            {wantsInvoice && (
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <input
                    className={`input w-full ${errorText('company_name') ? 'border-red-500' : ''}`}
                    placeholder="Cégnév*"
                    value={form.company_name}
                    onChange={e => update('company_name', e.target.value)}
                    onBlur={() => markTouched('company_name')}
                  />
                  {errorText('company_name') && (
                    <p className="text-red-500 text-xs mt-1">{errorText('company_name')}</p>
                  )}
                </div>

                <div>
                  <input
                    className={`input w-full ${errorText('company_tax_number') ? 'border-red-500' : ''}`}
                    placeholder="Adószám (pl. 12345678-1-12)*"
                    value={form.company_tax_number}
                    onChange={e => update('company_tax_number', e.target.value)}
                    onBlur={() => markTouched('company_tax_number')}
                  />
                  {errorText('company_tax_number') && (
                    <p className="text-red-500 text-xs mt-1">{errorText('company_tax_number')}</p>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* cím mentése */}
          <div className="flex flex-col gap-1 mt-2">
            {hasMatchingSavedAddress ? (
              <p className="text-xs text-green-700">
                Ez a cím már el van mentve a fiókodban.
              </p>
            ) : (
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={saveShippingAddress}
                  onChange={e => setSaveShippingAddress(e.target.checked)}
                />
                <span>Elmentem ezt a szállítási címet későbbi rendeléshez</span>
              </label>
            )}
          </div>

          {/* számlázási cím pipa */}
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={billingSameAsShipping}
                onChange={e => setBillingSameAsShipping(e.target.checked)}
              />
              <span>A számlázási cím megegyezik a szállítási címmel</span>
            </label>
          </div>

          {/* eltérő számlázási cím */}
          {!billingSameAsShipping && (
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3">
              <h3 className="font-semibold text-gray-700">Számlázási cím</h3>
              <div className="grid lg:grid-cols-3 grid-cols-1 gap-3 w-full">
                <div className='w-full'>
                  <input
                    className={`input ${errorText('billing_zip') ? 'border-red-500' : ''} w-full`}
                    placeholder="Irányítószám"
                    value={form.billing_zip}
                    onChange={e => update('billing_zip', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                    onBlur={() => markTouched('billing_zip')}
                  />
                  {errorText('billing_zip') && <p className="text-red-500 text-xs mt-1">{errorText('billing_zip')}</p>}
                </div>

                <input
                  className={`input col-span-2 ${errorText('billing_city') ? 'border-red-500' : ''}`}
                  placeholder="Város"
                  value={form.billing_city}
                  onChange={e => update('billing_city', e.target.value)}
                  onBlur={() => markTouched('billing_city')}
                />
                {errorText('billing_city') && <p className="text-red-500 text-xs mt-1 col-span-3">{errorText('billing_city')}</p>}
              </div>

              <div>
                <input
                  className={`input ${errorText('billing_address') ? 'border-red-500' : ''} w-full`}
                  placeholder="Cím (utca, házszám)"
                  value={form.billing_address}
                  onChange={e => update('billing_address', e.target.value)}
                  onBlur={() => markTouched('billing_address')}
                />
                {errorText('billing_address') && <p className="text-red-500 text-xs mt-1">{errorText('billing_address')}</p>}
              </div>

              <div>
                <input
                  className="input w-full"
                  placeholder="Emelet, ajtó (opcionális)"
                  value={form.billing_address_extra}
                  onChange={e => update('billing_address_extra', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 – ÖSSZEGZÉS */}
      {step === 4 && (
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Név:</strong> {form.lastname} {form.firstname}</p>
          <p><strong>E-mail:</strong> {form.email}</p>
          <p><strong>Telefon:</strong> {`${dial} ${form.phone}`}</p>
          <p><strong>Szállítási mód:</strong> {form.shipping || '–'}</p>

          {/* Alkalmazott kupon megjelenítés */}
          {appliedCoupon && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-900">Alkalmazott kupon</p>
              <p className="font-mono text-sm">{couponCode}</p>
              {appliedCoupon.discountAmount > 0 && (
                <p className="text-sm text-green-700">Kedvezmény: -{appliedCoupon.discountAmount.toLocaleString('hu-HU')} Ft</p>
              )}
              {appliedCoupon.shippingDiscount > 0 && (
                <p className="text-sm text-green-700">Ingyenes szállítás</p>
              )}
            </div>
          )}

          <div className="mt-3">
            <p className="font-semibold">Szállítási cím</p>
            <p>{form.zip} {form.city}</p>
            <p>{form.address}{form.address_extra && `, ${form.address_extra}`}</p>
          </div>

          <div className="mt-3">
            <p className="font-semibold">Számlázási adatok</p>
            {wantsInvoice && form.company_name && (
              <p><strong>Cégnév:</strong> {form.company_name}</p>
            )}
            {wantsInvoice && form.company_tax_number && (
              <p><strong>Adószám:</strong> {form.company_tax_number}</p>
            )}

            {billingSameAsShipping ? (
              <>
                <p>{form.zip} {form.city}</p>
                <p>{form.address}{form.address_extra && `, ${form.address_extra}`}</p>
              </>
            ) : (
              <>
                <p>{form.billing_zip} {form.billing_city}</p>
                <p>{form.billing_address}{form.billing_address_extra && `, ${form.billing_address_extra}`}</p>
              </>
            )}
          </div>


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
