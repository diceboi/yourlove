import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminSliderListSettings from "@/app/components/admin/AdminSliderListSettings"
import AdminSliderListClient from "@/app/components/admin/AdminSliderListClient"

export default function AdminSliderekPage() {
    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <AdminHero />
                    <AdminSliderListSettings />
                    <AdminSliderListClient />
                </div>
            </div>
        </div>
    )
}
