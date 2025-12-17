'use client'

import { useEffect, useState } from 'react'
import AdminSliderList from './AdminSliderList'
import { createClient } from '@/utils/supabase/client'

export default function AdminSliderListClient() {
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function fetchSlides() {
            const { data, error } = await supabase
                .from('hero_slides')
                .select('*')
                .order('display_order', { ascending: true })

            if (data) setSlides(data)
            setLoading(false)
        }

        fetchSlides()

        // Listen for custom events when slides change
        const handleSlidesChanged = () => {
            fetchSlides()
        }

        window.addEventListener('admin:slides:changed', handleSlidesChanged)
        return () => {
            window.removeEventListener('admin:slides:changed', handleSlidesChanged)
        }
    }, [])

    return <AdminSliderList slides={slides} loading={loading} />
}
