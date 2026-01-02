"use client"

import { useRouter } from "next/navigation"
import Modal from "@/app/components/UI/Modal"
import AdminAnnouncementCreate from "@/app/components/admin/AdminAnnouncementCreate"

export default function NewAnnouncementModal() {
    const router = useRouter()

    return (
        <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
            <AdminAnnouncementCreate onClose={() => router.back()} />
        </Modal>
    )
}
