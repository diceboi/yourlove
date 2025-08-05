import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminProductListSettings from "@/app/components/admin/AdminProductListSettings"
import AdminProductListClient from "@/app/components/admin/AdminProductListClient"

export default function AdminTermekPage() {
  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminHero />
          <AdminProductListSettings />
          <AdminProductListClient />
        </div>
      </div>
    </div>
  )
}
