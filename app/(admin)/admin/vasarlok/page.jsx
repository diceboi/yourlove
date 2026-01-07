import AdminHero from "@/app/components/admin/AdminHero";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminCustomerList from "@/app/components/admin/AdminCustomerList";
import AdminCustomerListSettings from "@/app/components/admin/AdminCustomerListSettings";
import { createClient } from "@/utils/supabase/server";

export default async function AdminVasarlokPage() {
  const supabase = await createClient();

  // Initial data fetch - can be expanded or use client-side fetching as in the list component
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
        <AdminSideMenu />
        <div className="flex-1 flex flex-col">
           {/* Admin Hero can be here if needed for breadcrumbs/search context */}
          <div className="flex-1 overflow-auto">
             <AdminHero title="Vásárlók" />
             <AdminCustomerListSettings />
             <div className="mt-0">
                 <AdminCustomerList users={users || []} />
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
