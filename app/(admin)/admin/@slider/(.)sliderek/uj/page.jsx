"use client"

import { useRouter } from "next/navigation"
import Modal from "@/app/components/UI/Modal"
import AdminSliderCreate from "@/app/components/admin/AdminSliderCreate"

export default function NewSliderModal() {
    const router = useRouter()

    return (
        <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
            <AdminSliderCreate onClose={() => router.back()} />
        </Modal>
    )
}
