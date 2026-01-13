import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminUserEdit from "@/app/components/admin/AdminUserEdit"

export const metadata = {
    title: 'Felhasználó szerkesztése - Admin',
    description: 'Felhasználó szerepkör módosítása'
}

export default async function AdminUserEditPage({ params }) {
    const { id } = await params

    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <AdminHero />
                    <div className="px-6 py-6">
                        <AdminUserEdit userId={id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'
