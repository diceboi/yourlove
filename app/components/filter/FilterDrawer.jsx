'use client'
import { useEffect } from 'react'
import { useFilterDrawer } from './FilterDrawerProvider'
import { TbX } from 'react-icons/tb'

export default function FilterDrawer({ children }) {
  const { open, close } = useFilterDrawer()

  // ESC zárás
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') close() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      {/* háttér overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-200 z-40 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
        aria-hidden={!open}
      />
      {/* drawer */}
      <aside
        className={`fixed top-0 left-0 h-dvh w-[90vw] max-w-[420px] bg-white z-1000 shadow-xl
                    transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-[-100%]'}`}
        role="dialog" aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 h-12">
          <div className="font-medium">Szűrők</div>
          <button onClick={close} className="p-2 rounded hover:bg-gray-100" aria-label="Szűrő bezárása">
            <TbX className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100dvh-56px-56px)] px-4 py-3">
          {children}
        </div>

        <div className="h-14 border-t px-4 flex items-center justify-end gap-2">
          <button onClick={close} className="px-4 py-2 rounded-full border">Mégse</button>
          <button onClick={close} className="px-4 py-2 rounded-full bg-[var(--pink)] text-white">Kész</button>
        </div>
      </aside>
    </>
  )
}
