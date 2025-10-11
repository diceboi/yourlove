import Link from 'next/link'

export default function ThankYou({ searchParams }) {
  const orderId = searchParams?.order
  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Köszönjük a rendelést!</h1>
      <p className="text-gray-600">Rendelésszám: {orderId || '—'}</p>

      <Link
        href="/termekek"
        className="mt-6 inline-block px-5 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90"
      >
        Vissza a boltba
      </Link>
    </div>
  )
}
