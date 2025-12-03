'use client'
import { createContext, useContext, useState } from 'react'

const FavoritesUIContext = createContext(null)

export function FavoritesUIProvider({ children }) {
    const [open, setOpen] = useState(false)
    const value = { open, setOpen, toggle: () => setOpen(o => !o) }
    return <FavoritesUIContext.Provider value={value}>{children}</FavoritesUIContext.Provider>
}

export function useFavoritesUI() {
    const ctx = useContext(FavoritesUIContext)
    if (!ctx) throw new Error('useFavoritesUI csak FavoritesUIProvider-ben használható')
    return ctx
}
