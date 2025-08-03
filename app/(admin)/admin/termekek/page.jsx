import AdminHero from "@/app/components/admin/AdminHero";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminProductListSettings from "@/app/components/admin/AdminProductListSettings";
import AdminProductList from "@/app/components/admin/AdminProductList";
import { createClient } from "@/utils/supabase/server";

export default async function AdminTermekPage() {
  const supabase = await createClient();

  const { data: product, error } = await supabase.from("products").select("*");

  return (
    <>
      <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
        <AdminSideMenu />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto">
            <AdminHero />
            <AdminProductListSettings />
            <AdminProductList products={product} />
          </div>
        </div>
      </div>
    </>
  );
}
