'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getOrCreateCart } from '@/app/_actions/cart'
import { Resend } from "resend"
import OrderConfirmationEmail from '../../emails/OrderConfirmationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

function toInt(x) {
  if (x == null) return null
  const n = Number(String(x).replace(/\s+/g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n) : null
}

// cím összehasonlításhoz pici helper
function normalizeAddress(zip, city, line1) {
  return [zip, city, line1]
    .map(v => (v || '').trim().toLowerCase())
    .filter(Boolean)
    .join('|')
}

/* -------------------------------------------------
   EMAIL KÜLDÉS Resend-del
-------------------------------------------------- */
export async function sendOrderEmail({
  to,
  name,
  orderId,
  items,
  total,
  orderDate,
  billingName,
  billingZip,
  billingCity,
  billingAddress,
  shippingMethod,
  shippingZip,
  shippingCity,
  shippingAddress,
  wantsInvoice,
  companyName,
  companyTaxNumber,
  couponCode,
  couponDiscount,
}) {
  await resend.emails.send({
    from: "Rendelés visszaigazolás <info@yourlove.hu>",
    to,
    subject: `Rendelés visszaigazolás – #${orderId}`,
    react: OrderConfirmationEmail({
      name,
      orderId,
      items,
      total,
      orderDate,
      billingName,
      billingZip,
      billingCity,
      billingAddress,
      shippingMethod,
      shippingZip,
      shippingCity,
      shippingAddress,
      wantsInvoice,
      companyName,
      companyTaxNumber,
      couponCode,
      couponDiscount,
    }),
  })
}

/* -------------------------------------------------
   FŐ MŰVELET: Rendelés létrehozása a kosárból
   + számlázási cím logika
   + user_addresses mentés
-------------------------------------------------- */
export async function createOrderFromCart(payload) {
  const sb = await createClient()

  // 1) user session
  const { data: { user } } = await sb.auth.getUser().catch(() => ({ data: { user: null } }))

  // 2) kosár
  const cart = await getOrCreateCart()

  if (user && !cart.user_id) {
    await sb.from('carts')
      .update({ user_id: user.id })
      .eq('id', cart.id)
      .is('user_id', null)
  }

  // 3) kosár tételek
  const { data: items, error: ciErr } = await sb
    .from('cart_items')
    .select(`
    id,
    product_id,
    qty,
    unit_price_huf,
    product:products (
      fo_cim,
      alcim,
      termekkep
    )
  `)
    .eq('cart_id', cart.id)


  if (ciErr) return { ok: false, message: ciErr.message }
  if (!items?.length) return { ok: false, message: 'A kosár üres.' }

  // 4) összegzés és line item-ek
  const lines = items.map(it => ({
    product_id: it.product_id,
    product_name: [it.product?.fo_cim, it.product?.alcim]
      .filter(Boolean)
      .join(" "),
    product_image: it.product?.termekkep || null,
    qty: toInt(it.qty) || 1,
    unit_price_huf: toInt(it.unit_price_huf) || 0,
    line_total_huf: (toInt(it.unit_price_huf) || 0) * (toInt(it.qty) || 1),
  }))

  let order_total = lines.reduce((s, l) => s + l.line_total_huf, 0)
  let coupon_discount = 0
  let shipping_discount = 0

  // Kupon feldolgozása
  if (payload.couponCode && payload.couponData) {
    coupon_discount = payload.couponData.discountAmount || 0
    shipping_discount = payload.couponData.shippingDiscount || 0

    // Levon az összegből
    order_total = Math.max(0, order_total - coupon_discount)
  }

  // --- Címek összerakása (szállítási + számlázási) ---

  const shipping_zip = payload.zip || null
  const shipping_city = payload.city || null
  const shipping_address = [payload.address, payload.address_extra]
    .filter(Boolean)
    .join(', ') || null

  // számlázási cím logika, ahogy eddig is
  let billing_zip, billing_city, billing_address

  if (payload.billingDifferent) {
    billing_zip = payload.billing_zip || shipping_zip
    billing_city = payload.billing_city || shipping_city
    billing_address = [
      payload.billing_address,
      payload.billing_address_extra,
    ]
      .filter(Boolean)
      .join(', ') || shipping_address
  } else {
    billing_zip = shipping_zip
    billing_city = shipping_city
    billing_address = shipping_address
  }

  const orderRow = {
    user_id: user?.id ?? null,
    cart_id: cart.id,
    status: 'processing',
    currency: 'HUF',
    email: payload.email,
    phone: payload.phone,
    customer_lastname: payload.lastname,
    customer_firstname: payload.firstname,
    shipping_method: payload.shipping || null,

    // ÚJ: szállítási cím snapshot
    shipping_zip,
    shipping_city,
    shipping_address,

    // Számlázási cím snapshot
    billing_zip,
    billing_city,
    billing_address,

    notes: payload.notes || null,
    total_huf: order_total,
    company_name: payload.company_name || null,
    company_tax_number: payload.company_tax_number || null,
    wants_vat_invoice: !!payload.wantsInvoice,
    // Kupon mezők
    coupon_code: payload.couponCode || null,
    coupon_discount: coupon_discount,
  }

  const { data: created, error: oErr } = await sb
    .from('orders')
    .insert(orderRow)
    .select('id, order_number')
    .single()

  if (oErr) return { ok: false, message: oErr.message }

  // 6) order_items beszúrás
  const oiRows = lines.map(l => ({
    order_id: created.id,
    product_id: l.product_id,
    name: l.product_name,
    image_url: l.product_image,
    qty: l.qty,
    unit_price_huf: l.unit_price_huf,
    vat_rate: 27,
  }))


  const { error: oiErr } = await sb.from('order_items').insert(oiRows)
  if (oiErr) return { ok: false, message: oiErr.message }

  // 7) kosár lezárása
  await sb.from('carts').update({ status: 'converted' }).eq('id', cart.id)
  await sb.from('cart_items').delete().eq('cart_id', cart.id)

  // 7b) Kupon használat naplózása
  if (payload.couponCode && payload.couponData?.coupon?.id) {
    try {
      const { logCouponUse } = await import('./coupon')
      await logCouponUse(
        payload.couponData.coupon.id,
        created.id,
        user?.id || null,
        coupon_discount + shipping_discount
      )
    } catch (e) {
      console.error('Kupon használat naplózása sikertelen:', e)
    }
  }

  // 8) cím mentése user_addresses-be, ha kérte és be van jelentkezve
  try {
    if (user && payload.saveShippingAddress) {
      const line1 = shippingAddressLine

      // meglévő címek betöltése userhez
      const { data: existing, error: addrErr } = await sb
        .from('user_addresses')
        .select('id, zip, city, line1')
        .eq('user_id', user.id)

      if (!addrErr) {
        const currentNorm = normalizeAddress(payload.zip, payload.city, line1)
        const already = existing?.some(a =>
          normalizeAddress(a.zip, a.city, a.line1) === currentNorm
        )

        if (!already) {
          const hasAny = existing && existing.length > 0
          await sb.from('user_addresses').insert({
            user_id: user.id,
            label: 'Pénztárból mentett cím',
            firstname: payload.firstname,
            lastname: payload.lastname,
            country: 'Magyarország',
            zip: payload.zip,
            city: payload.city,
            line1,
            phone: payload.phone,
            is_default: hasAny ? false : true,
          })
        }
      }
    }
  } catch (e) {
    console.error('Cím mentése sikertelen:', e)
    // nem dobunk hibát, az order attól még sikeres marad
  }

  /* -------------------------------------------------
     9) EMAIL KÜLDÉS – immár a végleges billing címmel
  -------------------------------------------------- */

  const displayOrderId = String(created.order_number).padStart(6, '0')

  await sendOrderEmail({
    to: payload.email,
    name: `${payload.lastname} ${payload.firstname}`,
    orderId: displayOrderId,
    items: lines.map((l) => ({
      id: l.product_id,
      name: l.product_name,
      qty: l.qty,
      price: l.unit_price_huf,
    })),
    total: order_total,
    orderDate: new Date().toLocaleString("hu-HU"),
    billingName: `${payload.lastname} ${payload.firstname}`,
    billingZip: billing_zip,
    billingCity: billing_city,
    billingAddress: billing_address,
    shippingMethod: payload.shipping,
    shippingZip: shipping_zip,
    shippingCity: shipping_city,
    shippingAddress: shipping_address,
    wantsInvoice: !!payload.wantsInvoice,
    companyName: payload.company_name || null,
    companyTaxNumber: payload.company_tax_number || null,
    couponCode: payload.couponCode || null,
    couponDiscount: coupon_discount || 0,
  })

  return { ok: true, orderId: displayOrderId }
}
