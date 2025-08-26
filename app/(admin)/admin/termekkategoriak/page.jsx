import AdminHero from "@/app/components/admin/AdminHero"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminProductCategoryListSettings from "@/app/components/admin/AdminProductCategoryListSettings"
import AdminProductCategoriesListClient from "@/app/components/admin/AdminProductCategoriesListClient"

export default function AdminTermekKategoriakPage() {
  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminHero />
          <AdminProductCategoryListSettings />
          <AdminProductCategoriesListClient />
        </div>
      </div>
    </div>
  )
}