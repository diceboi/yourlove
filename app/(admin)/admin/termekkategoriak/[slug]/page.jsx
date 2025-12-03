import * as React from "react";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminHero from "@/app/components/admin/AdminHero";
import AdminProductCategoriesEdit from "@/app/components/admin/AdminProductCategoriesEdit";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0

export default async function ProductCategoriesPage({ params }) {

  const { slug } = await params
  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("product-categories")
    .select("*")
    .eq("id", slug)
    .single();

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminProductCategoriesEdit category={category} />
        </div>
      </div>
    </div>
  );
}
