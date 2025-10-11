'use client'
import { Suspense } from 'react'
import { useCartUI } from './CartUIProvider'
import { TbX } from "react-icons/tb";

export default function CartDrawerClient({ content, footer }) {
  const { open, setOpen } = useCartUI()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity z-40 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50
                       transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold">Kosár</h3>
          <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-800">
            <TbX className='w-6 h-auto'/>
          </button>
        </div>

        <div className="h-[calc(100%-175px)] overflow-y-auto">
          <Suspense fallback={<div className="p-4">Betöltés…</div>}>
            {content}
          </Suspense>
        </div>

        <div className="p-4 border-t">
          <Suspense fallback={<div className="p-2">...</div>}>
            {footer}
          </Suspense>
        </div>
      </div>
    </>
  )
}
