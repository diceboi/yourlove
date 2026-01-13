import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import PointsTabs from "@/app/components/admin/PointsTabs"
import { createClient } from "@/utils/supabase/server"

export const metadata = {
    title: 'Pontok - Admin',
    description: 'Hűségpontok kezelése'
}

export default async function AdminPointsPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('user_profiles')
        .select('*')
        .order('points', { ascending: false })

    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <AdminHero />

                    {/* Tabs - now a client component */}
                    <PointsTabs users={users || []} />
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'
