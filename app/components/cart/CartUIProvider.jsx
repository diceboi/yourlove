'use client'
import { createContext, useContext, useState } from 'react'

const CartUIContext = createContext(null)

export function CartUIProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = { open, setOpen, toggle: () => setOpen(o => !o) }
  return <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>
}

export function useCartUI() {
  const ctx = useContext(CartUIContext)
  if (!ctx) throw new Error('useCartUI csak CartUIProvider-ben használható')
  return ctx
}
