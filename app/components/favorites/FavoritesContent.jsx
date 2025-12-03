'use client'

import { useState, useEffect } from 'react'
import FavoritesItemRow from './FavoritesItemRow'

export default function FavoritesContent() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    async function fetchFavorites() {
        try {
            setLoading(true)
            const res = await fetch('/api/favorites', { cache: 'no-store' })
            const data = await res.json()
            setItems(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error('Failed to fetch favorites:', e)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFavorites()
    }, [])

    useEffect(() => {
        const onChanged = () => fetchFavorites()
        const onAuthChanged = () => {
            // Refetch when user logs in/out
            setItems([])
            setTimeout(() => fetchFavorites(), 100)
        }

        window.addEventListener('favorites:changed', onChanged)
        window.addEventListener('auth:changed', onAuthChanged)
        return () => {
            window.removeEventListener('favorites:changed', onChanged)
            window.removeEventListener('auth:changed', onAuthChanged)
        }
    }, [])

    if (loading) {
        return (
            <div className="p-4 text-sm text-gray-600">
                Betöltés...
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="p-4 text-sm text-gray-600">
                Még nincsenek kedvenceid.
            </div>
        )
    }

    return (
        <ul className="border-t border-[var(--border)]">
            {items.map(item => (
                <li key={item.id} className="p-4 border-b border-[var(--border)]">
                    <FavoritesItemRow item={item} />
                </li>
            ))}
        </ul>
    )
}
