'use client'
import { Suspense, useEffect } from 'react'
import { useFavoritesUI } from './FavoritesUIProvider'
import { TbX } from "react-icons/tb";
import { useRouter } from 'next/navigation';

export default function FavoritesDrawerClient({ content }) {
    const { open, setOpen } = useFavoritesUI()
    const router = useRouter()

    useEffect(() => {
        const onOpen = () => setOpen(true)
        const onClose = () => setOpen(false)
        const onChanged = () => router.refresh()

        window.addEventListener('favorites:open', onOpen)
        window.addEventListener('favorites:close', onClose)
        window.addEventListener('favorites:changed', onChanged)
        return () => {
            window.removeEventListener('favorites:open', onOpen)
            window.removeEventListener('favorites:close', onClose)
            window.removeEventListener('favorites:changed', onChanged)
        }
    }, [router, setOpen])

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 transition-opacity z-40 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <div className={`fixed right-0 top-0 h-full w-[90vw] max-w-md bg-white shadow-2xl z-50
                       transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold">Kedvencek</h3>
                    <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-800">
                        <TbX className='w-6 h-auto' />
                    </button>
                </div>

                <div className="h-[calc(100%-65px)] overflow-y-auto">
                    <Suspense fallback={<div className="p-4">Betöltés…</div>}>
                        {content}
                    </Suspense>
                </div>
            </div>
        </>
    )
}
