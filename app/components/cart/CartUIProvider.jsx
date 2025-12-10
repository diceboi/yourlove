'use client'
import { createContext, useContext } from 'react'
import { MenuContext } from '@/app/MenuContext'

// We keep the Context object if there are other consumers expecting it, 
// but implementation delegates to MenuContext.
const CartUIContext = createContext(null)

export function CartUIProvider({ children }) {
  const { activeDrawer, setActiveDrawer } = useContext(MenuContext)
  
  const open = activeDrawer === 'cart'
  const setOpen = (val) => val ? setActiveDrawer('cart') : setActiveDrawer(null)
  const toggle = () => open ? setOpen(false) : setOpen(true)

  const value = { open, setOpen, toggle }
  
  return <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>
}

export function useCartUI() {
  const ctx = useContext(CartUIContext)
  if (!ctx) throw new Error('useCartUI csak CartUIProvider-ben használható')
  return ctx
}
