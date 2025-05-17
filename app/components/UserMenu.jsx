import { TbUser } from "react-icons/tb"
import Paragraph from "./UI/Paragraph"

export default function UserMenu() {
  return (
    <button className="flex flex-nowrap gap-2 items-center px-6 py-2 hover:bg-[var(--border)] h-[44px] rounded-full cursor-pointer">
        <TbUser className="w-6 h-6 text-[var(--pink)]" />
        <Paragraph>Bejelentkezés</Paragraph>
    </button>
  )
}
