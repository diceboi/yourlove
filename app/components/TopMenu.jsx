import MenuText from "./UI/Texts/MenuText"
import Link from "next/link"
import { TbBrandFacebook, TbBrandYoutube, TbBrandTiktok } from "react-icons/tb"

export default function TopMenu() {
  return (
    <div className="bg-[var(--black)] z-[999]">
      <div className="flex flex-nowrap min-h-8 items-center justify-between w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto">
        <div className="flex flex-nowrap gap-4 min-w-fit">
          <div className="flex flex-nowrap gap-2">
          <TbBrandYoutube className="w-5 h-5 text-white"/>
          <TbBrandTiktok className="w-5 h-5 text-white"/>
          <TbBrandFacebook className="w-5 h-5 text-white"/>
          </div>
        </div>

        <div className="relative w-full overflow-hidden h-6">
            <div className="absolute top-0 left-0 w-[50px] h-full z-10 bg-gradient-to-r from-[var(--black)] to-transparent"></div>
            <div className="absolute top-0 right-0 w-[50px] h-full z-10 bg-gradient-to-l from-[var(--black)] to-transparent"></div>
          <div className="absolute whitespace-nowrap animate-marquee text-white text-sm">
            🎉 Ingyenes kiszállítás 20.000 Ft felett! • 🎁 Új őszi akciók most elérhetők! • ☀️ Fizessen SimplePay-jel biztonságosan!
          </div>
        </div>

        <div className="flex flex-nowrap gap-4">
            <Link href="/blog">
                <MenuText classname={"text-white hover:underline"}>
                    Blog
                </MenuText>    
            </Link>
            <Link href="/gyik">
                <MenuText classname={"text-white hover:underline"}>
                    Gyik
                </MenuText>    
            </Link>
            <Link href="/rolunk">
                <MenuText classname={"text-white hover:underline"}>
                    Rólunk
                </MenuText>    
            </Link>
            <Link href="/kapcsolat">
                <MenuText classname={"text-white hover:underline"}>
                    Kapcsolat
                </MenuText>    
            </Link>
        </div>

        <style jsx>{`
            @keyframes marquee {
            0% { transform: translateX(150%); }
            100% { transform: translateX(-100%); }
            }
            .animate-marquee {
            animation: marquee 25s linear infinite;
            }
        `}</style>

      </div>

    </div>
  )
}
