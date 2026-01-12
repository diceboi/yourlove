import AdminSideMenu from '@/app/components/admin/AdminSideMenu'
import AdminCouponEdit from '@/app/components/admin/AdminCouponEdit'

export default async function AdminKuponEditPage({ params }) {
    const { id } = await params

    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-2xl mx-auto">
                        <AdminCouponEdit couponId={id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
