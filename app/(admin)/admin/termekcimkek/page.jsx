import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminProductTagsSettings from "@/app/components/admin/AdminProductTagsSettings"
import AdminProductTagsClient from "@/app/components/admin/AdminProductTagsClient"

export default function AdminTermekCimkekPage() {
  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminHero />
          <AdminProductTagsSettings />
          <AdminProductTagsClient />
        </div>
      </div>
    </div>
  )
}
