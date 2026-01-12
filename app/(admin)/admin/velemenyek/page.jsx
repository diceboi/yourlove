import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminReviewList from "@/app/components/admin/AdminReviewList"

export const metadata = {
    title: 'Vélemények moderálása - Admin',
    description: 'Termék értékelések moderálása'
}

export default function AdminReviewsPage() {
    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <AdminHero />
                    <AdminReviewList />
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'
