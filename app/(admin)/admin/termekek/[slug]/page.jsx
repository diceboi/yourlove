import * as React from "react";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminHero from "@/app/components/admin/AdminHero";
import AdminProductEdit from "@/app/components/admin/AdminProductEdit";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0

export default async function ProductPage({ params }) {

  const { slug } = await params
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("seo_slug", slug)
    .single();

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-auto">
          <AdminHero />
          <AdminProductEdit product={product} />
        </div>
      </div>
    </div>
  );
}
