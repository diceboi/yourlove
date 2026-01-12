'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/app/components/UI/Modal'
import AdminCouponEdit from '@/app/components/admin/AdminCouponEdit'
import AdminCouponCreate from '@/app/components/admin/AdminCouponCreate'

export default function InterceptedKuponEdit({ params }) {
    const router = useRouter()
    const { id } = use(params)

    return (
        <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
            {id === 'uj' ? (
                <AdminCouponCreate />
            ) : (
                <AdminCouponEdit couponId={id} />
            )}
        </Modal>
    )
}
