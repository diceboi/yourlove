'use client'
import { createContext, useContext } from 'react'
import { MenuContext } from '@/app/MenuContext'

const FavoritesUIContext = createContext(null)

export function FavoritesUIProvider({ children }) {
    const { activeDrawer, setActiveDrawer } = useContext(MenuContext)

    const open = activeDrawer === 'favorites'
    const setOpen = (val) => val ? setActiveDrawer('favorites') : setActiveDrawer(null)
    const toggle = () => open ? setOpen(false) : setOpen(true)

    const value = { open, setOpen, toggle }
    return <FavoritesUIContext.Provider value={value}>{children}</FavoritesUIContext.Provider>
}

export function useFavoritesUI() {
    const ctx = useContext(FavoritesUIContext)
    if (!ctx) throw new Error('useFavoritesUI csak FavoritesUIProvider-ben használható')
    return ctx
}
