import Breadcrumbs from "@/app/components/UI/Breadcrumbs"
import H1 from "@/app/components/UI/Texts/H1"
import H2 from "@/app/components/UI/Texts/H2"
import Paragraph from "@/app/components/UI/Texts/Paragraph"
import ContactForm from "@/app/components/UI/ContactForm"
import KapcsolatAnimation from "@/app/components/UI/Animations/KapcsolatAnimation"

export default function page() {
  return (
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
      <Breadcrumbs />
      <div className="flex flex-col gap-4 w-full my-8">
        <div className="flex flex-col items-center justify-center relative w-full xl:h-[50vh] h-[50vh] rounded-2xl xl:pt-0 pt-8">
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--grey-bg)] rounded-2xl" />
            <div className="w-full flex flex-col gap-8 items-start justify-between">
                <div className="flex flex-col items-center gap-8 z-10 w-full">
                    <H1 classname="text-center text-[var(--pink)]">Kapcsolat</H1>
                    <Paragraph classname="text-center lg:w-1/3 w-full">
                        Írj nekünk ha kérdésed, kérésed észrevételed van. Igyekszünk minél gyorsabban válaszolni!
                    </Paragraph>
                </div>
                <div className="z-10 absolute xl:-top-44 -top-44 left-1/2 -translate-x-1/2">
                    <KapcsolatAnimation/>
                </div>
            </div>
        </div>
        <div className="m-auto lg:w-1/2 w-full p-4 rounded-2xl bg-white -mt-20 z-10 shadow-2xl">
            <ContactForm />
        </div>
      </div>
    </div>
  )
}
