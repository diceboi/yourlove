import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import AdminSideMenu from "@/app/components/admin/AdminSideMenu"
import AdminSliderEdit from "@/app/components/admin/AdminSliderEdit"

export default async function EditSliderPage({ params }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: slide, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("id", id)
        .maybeSingle()

    if (error || !slide) {
        notFound()
    }

    return (
        <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
            <AdminSideMenu />
            <div className="flex-1 flex items-start justify-center overflow-auto p-6">
                <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg">
                    <AdminSliderEdit slide={slide} />
                </div>
            </div>
        </div>
    )
}
