import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminUserList from "@/app/components/admin/AdminUserList"
import { createClient } from "@/utils/supabase/server"

export const metadata = {
    title: 'Felhasználók - Admin',
    description: 'Felhasználók kezelése'
}

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <AdminHero />
                    <AdminUserList users={users || []} />
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'
