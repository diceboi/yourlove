import * as React from "react";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminHero from "@/app/components/admin/AdminHero";
import AdminProductTagsEdit from "@/app/components/admin/AdminProductTagsEdit";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0

export default async function TagsPage({ params }) {

  const { slug } = await params
  const supabase = await createClient();
  const { data: tags, error } = await supabase
    .from("product-tags")
    .select("*")
    .eq("id", slug)
    .single();

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminHero />
          <AdminProductTagsEdit tags={tags} />
        </div>
      </div>
    </div>
  );
}
