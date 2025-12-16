import { createClient } from "@/utils/supabase/server"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminPageBuilderModal from "@/app/components/admin/PageBuilder/AdminPageBuilderModal"

export default async function AdminCustomPageEditPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Try to parse as ID first, then as slug
  const numId = Number(id)
  let page = null
  
  if (Number.isFinite(numId)) {
    const { data } = await supabase
      .from("custom_pages")
      .select("*")
      .eq("id", numId)
      .single()
    page = data
  }
  
  if (!page) {
    const { data } = await supabase
      .from("custom_pages")
      .select("*")
      .eq("slug", id)
      .single()
    page = data
  }

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminPageBuilderModal page={page} isNew={false} />
        </div>
      </div>
    </div>
  )
}
