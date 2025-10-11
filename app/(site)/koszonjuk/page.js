export default function ThankYou({ searchParams }) {
  const orderId = searchParams?.order
  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <h1 className="text-2xl font-semibold mb-2">Köszönjük a rendelést!</h1>
      <p className="text-gray-600">Rendelésszám: {orderId || '—'}</p>
      <a href="/termekek" className="mt-6 inline-block px-5 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90">
        Vissza a boltba
      </a>
    </div>
  )
}
