import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminAnnouncementListSettings from "@/app/components/admin/AdminAnnouncementListSettings"
import AdminAnnouncementListClient from "@/app/components/admin/AdminAnnouncementListClient"

export default function AdminHirdetesekPage() {
    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <AdminHero />
                    <AdminAnnouncementListSettings />
                    <AdminAnnouncementListClient />
                </div>
            </div>
        </div>
    )
}
