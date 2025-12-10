"use client";

import Link from "next/link";

export default function ReturnInfoPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Termék visszaküldés</h2>
      <p className="text-sm text-gray-700 mb-4">
        Itt találod a visszaküldés feltételeit és a teendőket.
      </p>
      <Link
        href="/visszakuldes"
        className="inline-block rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Visszaküldési információk
      </Link>
    </div>
  );
}
