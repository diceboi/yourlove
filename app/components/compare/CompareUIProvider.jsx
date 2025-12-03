'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const CompareUIContext = createContext(null)

export function CompareUIProvider({ children }) {
    const [open, setOpen] = useState(false)
    const [compareIds, setCompareIds] = useState([])

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('compare_products')
        if (stored) {
            try {
                const ids = JSON.parse(stored)
                setCompareIds(Array.isArray(ids) ? ids : [])
            } catch (e) {
                console.error('Failed to parse compare products', e)
            }
        }
    }, [])

    const addProduct = (productId) => {
        setCompareIds(prev => {
            if (prev.includes(productId)) return prev
            if (prev.length >= 3) {
                // Show toast async to avoid setState during render
                setTimeout(() => toast.info('Maximum 3 termék hasonlítható össze.'), 0)
                return prev
            }
            const next = [...prev, productId]
            localStorage.setItem('compare_products', JSON.stringify(next))
            return next
        })
    }

    const removeProduct = (productId) => {
        setCompareIds(prev => {
            const next = prev.filter(id => id !== productId)
            localStorage.setItem('compare_products', JSON.stringify(next))
            return next
        })
    }

    const clearAll = () => {
        setCompareIds([])
        localStorage.removeItem('compare_products')
    }

    const value = {
        open,
        setOpen,
        toggle: () => setOpen(o => !o),
        compareIds,
        addProduct,
        removeProduct,
        clearAll,
        count: compareIds.length
    }

    return <CompareUIContext.Provider value={value}>{children}</CompareUIContext.Provider>
}

export function useCompareUI() {
    const ctx = useContext(CompareUIContext)
    if (!ctx) throw new Error('useCompareUI csak CompareUIProvider-ben használható')
    return ctx
}
