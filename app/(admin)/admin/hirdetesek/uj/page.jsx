import AdminAnnouncementCreate from "@/app/components/admin/AdminAnnouncementCreate"

export default function AdminHirdetesUjPage() {
    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminAnnouncementCreate />
            </div>
        </div>
    )
}
