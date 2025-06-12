import { TbUser } from "react-icons/tb"
import Paragraph from "./UI/Texts/Paragraph"

export default function UserMenu() {
  return (
    <button className="flex flex-nowrap gap-2 items-center justify-center xl:px-6 xl:py-2 hover:bg-[var(--border)] xl:h-[44px] h-[40px] xl:w-auto w-[40px] rounded-full cursor-pointer">
        <TbUser className="w-5 h-5 text-[var(--pink)]" />
        <Paragraph classname={"xl:flex hidden"}>Bejelentkezés</Paragraph>
    </button>
  )
}
