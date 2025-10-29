'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContact(prevState, formData) {
  try {
    // anti-spam: honeypot
    if ((formData.get('company'))?.trim()) {
      return { ok: true, message: 'OK', spam: true } // csendben "siker"
    }

    const name = (formData.get('name') || '').trim()
    const email = (formData.get('email') || '').trim()
    const message = (formData.get('message') || '').trim()

    if (!name || !email || !message) {
      return { ok: false, message: 'Kérlek tölts ki minden mezőt.' }
    }
    // nagyon egyszerű email-ellenőrzés
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return { ok: false, message: 'Érvénytelen e-mail cím.' }
    }

    const to = process.env.CONTACT_TO
    const from = process.env.CONTACT_FROM

    const html = `
      <h2>Új üzenet a kapcsolat űrlapról</h2>
      <p><strong>Név:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Üzenet:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
    `

    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Kapcsolat űrlap – ${name}`,
      reply_to: email,
      html,
      tags: [{ name: 'type', value: 'contact-form' }],
      headers: { 'X-Entity-Type': 'transactional' },
    })

    if (error) return { ok: false, message: 'Küldési hiba történt.' }

    return { ok: true, message: 'Köszönjük! Üzenetedet megkaptuk.' }
  } catch {
    return { ok: false, message: 'Váratlan hiba történt.' }
  }
}

// egyszerű HTML-escape
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
