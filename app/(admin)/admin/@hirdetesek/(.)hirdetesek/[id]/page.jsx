"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Modal from "@/app/components/UI/Modal"
import { createClient } from "@/utils/supabase/client"
import AdminAnnouncementEdit from "@/app/components/admin/AdminAnnouncementEdit"

export default function AnnouncementEditModal() {
    const params = useParams()
    const router = useRouter()

    const [announcement, setAnnouncement] = useState(null)

    useEffect(() => {
        const fetchAnnouncement = async () => {
            const supabase = createClient()
            const idParam = params.id

            // Ha dinamikus route tömböt ad vissza, normalizáljuk stringgé
            const id = Array.isArray(idParam) ? idParam[0] : idParam

            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .eq("id", id)
                .single()

            if (error) {
                console.error("Hiba a hirdetés lekérésekor:", error)
            } else {
                setAnnouncement(data)
            }
        }

        if (params.id) fetchAnnouncement()
    }, [params.id])

    if (!announcement) {
        return (
            <Modal openstate={true} onClose={() => router.back()}>
                <p>Betöltés...</p>
            </Modal>
        )
    }

    return (
        <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
            <AdminAnnouncementEdit announcementId={announcement.id} />
        </Modal>
    )
}
