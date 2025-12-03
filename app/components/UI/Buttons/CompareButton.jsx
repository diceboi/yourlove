"use client"

import { TbArrowsLeftRight } from "react-icons/tb"
import { useCompareUI } from "../../compare/CompareUIProvider"

export default function CompareButton({ productId }) {
  const { compareIds, addProduct, removeProduct, setOpen } = useCompareUI()
  const isComparing = compareIds.includes(productId)

  function handleToggle(e) {
    e.preventDefault()
    e.stopPropagation()

    if (isComparing) {
      removeProduct(productId)
    } else {
      addProduct(productId)
      // Open drawer when adding
      window.dispatchEvent(new Event('compare:open'))
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`xl:min-w-[44px] min-w-[40px] xl:h-[44px] h-[40px] rounded-full flex items-center justify-center cursor-pointer transition-colors ${isComparing ? 'bg-[var(--pink)] text-white' : 'hover:bg-[var(--border)] text-[var(--pink)]'
        }`}
      title={isComparing ? "Eltávolítás az összehasonlításból" : "Hozzáadás az összehasonlításhoz"}
    >
      <TbArrowsLeftRight className="w-6 h-6" />
    </button>
  )
}
