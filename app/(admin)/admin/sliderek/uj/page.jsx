import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminSliderCreate from "@/app/components/admin/AdminSliderCreate"

export default function NewSliderPage() {
  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex items-start justify-center overflow-auto p-6">
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg">
          <AdminSliderCreate />
        </div>
      </div>
    </div>
  )
}
