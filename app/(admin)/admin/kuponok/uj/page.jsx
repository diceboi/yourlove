import AdminHero from '@/app/components/admin/AdminHero'
import AdminSideMenu from '@/app/components/admin/AdminSideMenu'
import AdminCouponCreate from '@/app/components/admin/AdminCouponCreate'

export default function UjKuponPage() {
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <AdminSideMenu />
            <div className="flex flex-col gap-6 w-full">
                <AdminHero title="Új kupon létrehozása" />
                <AdminCouponCreate />
            </div>
        </div>
    )
}
