import { TbMenu2 } from "react-icons/tb"

export default function MobileToggle() {
  return (
    <button className="flex xl:hidden xl:w-[44px] w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] items-center justify-center cursor-pointer">
      <TbMenu2 className="xl:w-6 w-5 xl:h-6 h-5 text-[var(--pink)]"/>
    </button>
  )
}
