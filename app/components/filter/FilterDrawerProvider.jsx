'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)
export function useFilterDrawer() {
  return useContext(Ctx)
}

export default function FilterDrawerProvider({ children }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen(v => !v), [])
  const close = useCallback(() => setOpen(false), [])
  const openFn = useCallback(() => setOpen(true), [])
  return <Ctx.Provider value={{ open, toggle, close, openFn }}>{children}</Ctx.Provider>
}
