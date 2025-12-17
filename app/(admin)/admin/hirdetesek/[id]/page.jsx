import AdminAnnouncementEdit from "@/app/components/admin/AdminAnnouncementEdit"

export default async function AdminHirdetesEditPage({ params }) {
    const { id } = await params

    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminAnnouncementEdit announcementId={id} />
            </div>
        </div>
    )
}
