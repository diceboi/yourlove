import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminBlogTagsListSettings from "@/app/components/admin/AdminBlogTagsListSettings"
import AdminBlogTagsListClient from "@/app/components/admin/AdminBlogTagsListClient"

export default function AdminBlogCimkekPage() {
  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminHero />
          <AdminBlogTagsListSettings />
          <AdminBlogTagsListClient />
        </div>
      </div>
    </div>
  )
}
