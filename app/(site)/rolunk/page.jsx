import Breadcrumbs from "@/app/components/UI/Breadcrumbs"
import H1 from "@/app/components/UI/Texts/H1"
import H2 from "@/app/components/UI/Texts/H2"
import Paragraph from "@/app/components/UI/Texts/Paragraph"
import PopularProducts from "@/app/components/PopularProducts"

export default function page() {
  return (
    <>
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
        <Breadcrumbs />
        <div className="flex flex-col gap-4 w-full my-8">
            <H1>Rólunk</H1>
            <H2>Miért érdemes nálunk vásárolni? Elmondjuk.</H2>
            <Paragraph classname={"pb-8"}>
                
            </Paragraph>

            <div className="flex flex-col gap-10">
            </div>
        </div>
    </div>
    <PopularProducts/>
    </>
  )
}
