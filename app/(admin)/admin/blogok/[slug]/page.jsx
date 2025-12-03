import * as React from "react";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminHero from "@/app/components/admin/AdminHero";
import AdminBlogEdit from "@/app/components/admin/AdminBlogEdit";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0

export default async function BlogsPage({ params }) {

  const { slug } = await params
  const supabase = await createClient();
  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", slug)
    .single();

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminBlogEdit blog={blog} />
        </div>
      </div>
    </div>
  );
}
