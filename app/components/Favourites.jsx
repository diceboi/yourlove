import { TbHeart } from "react-icons/tb"

export default function Favourites() {
  return (
    <button className="xl:w-[44px] w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer">
      <TbHeart className="xl:w-6 w-5 xl:h-6 h-5 text-[var(--pink)]"/>
    </button>
  )
}
