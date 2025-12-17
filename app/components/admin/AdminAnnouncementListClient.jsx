'use client'

import { useEffect, useState } from 'react'
import AdminAnnouncementList from './AdminAnnouncementList'
import { createClient } from '@/utils/supabase/client'

export default function AdminAnnouncementListClient() {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function fetchAnnouncements() {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('display_order', { ascending: true })

            if (data) setAnnouncements(data)
            setLoading(false)
        }

        fetchAnnouncements()

        // Listen for custom events when announcements change
        const handleAnnouncementsChanged = () => {
            fetchAnnouncements()
        }

        window.addEventListener('admin:announcements:changed', handleAnnouncementsChanged)
        return () => {
            window.removeEventListener('admin:announcements:changed', handleAnnouncementsChanged)
        }
    }, [])

    return <AdminAnnouncementList announcements={announcements} loading={loading} />
}
