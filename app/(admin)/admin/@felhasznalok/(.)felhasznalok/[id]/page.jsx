'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/app/components/UI/Modal'
import AdminUserEdit from '@/app/components/admin/AdminUserEdit'

export default function InterceptedUserEdit({ params }) {
    const router = useRouter()
    const { id } = use(params)

    return (
        <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
            <AdminUserEdit userId={id} onClose={() => router.back()} />
        </Modal>
    )
}
