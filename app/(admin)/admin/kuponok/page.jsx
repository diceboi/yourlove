import AdminSideMenu from '@/app/components/admin/AdminSideMenu'
import AdminCouponList from '@/app/components/admin/AdminCouponList'

export default async function AdminKuponokPage() {
    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-auto">
                    <AdminCouponList />
                </div>
            </div>
        </div>
    )
}
