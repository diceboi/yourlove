import { TbHeart } from "react-icons/tb"

export default function Favourites() {
  return (
    <button className="xl:min-w-[44px] min-w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer">
      <TbHeart className="w-6 h-6 text-[var(--pink)]"/>
    </button>
  )
}
