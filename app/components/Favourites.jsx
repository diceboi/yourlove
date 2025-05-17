import { TbHeart } from "react-icons/tb"

export default function Favourites() {
  return (
    <button className="w-[44px] h-[44px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer">
      <TbHeart className="w-6 h-6 text-[var(--pink)]"/>
    </button>
  )
}
