"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Modal from "@/app/components/UI/Modal"
import { createClient } from "@/utils/supabase/client"
import AdminSliderEdit from "@/app/components/admin/AdminSliderEdit"

export default function EditSliderModal() {
    const router = useRouter()
    const params = useParams()
    const supabase = useMemo(() => createClient(), [])

    const [slide, setSlide] = useState(null)
    const [loading, setLoading] = useState(true)

    const slideId = params?.id

    useEffect(() => {
        let alive = true

        const fetchSlide = async () => {
            if (!slideId) return
            setLoading(true)

            try {
                const { data, error } = await supabase
                    .from("hero_slides")
                    .select("*")
                    .eq("id", slideId)
                    .maybeSingle()

                if (error) {
                    console.error("Hiba a slide lekérésekor:", error)
                }

                if (alive) setSlide(data ?? null)
            } catch (e) {
                console.error("Váratlan hiba a slide lekérésekor:", e)
                if (alive) setSlide(null)
            } finally {
                if (alive) setLoading(false)
            }
        }

        fetchSlide()
        return () => { alive = false }
    }, [slideId, supabase])

    if (loading) {
        return (
            <Modal openstate={true} onClose={() => router.back()}>
                <p>Betöltés…</p>
            </Modal>
        )
    }

    if (!slide) {
        return (
            <Modal openstate={true} onClose={() => router.back()}>
                <p>Nem található slide a(z) "{String(slideId)}" azonosítóval.</p>
            </Modal>
        )
    }

    return (
        <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
            <AdminSliderEdit slide={slide} onClose={() => router.back()} />
        </Modal>
    )
}
