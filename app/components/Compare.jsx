"use client"

import { TbArrowsLeftRight } from "react-icons/tb"
import { useCompareUI } from "./compare/CompareUIProvider"

export default function Compare() {
    const { setOpen, count } = useCompareUI()

    const label = count > 99 ? '99+' : String(count)

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(true)}
                className="xl:min-w-[44px] min-w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer"
            >
                <TbArrowsLeftRight className="w-6 h-6 text-[var(--pink)]" />
            </button>

            {count > 0 && (
                <span
                    className="absolute top-0 -right-0 min-w-[18px] h-[18px] px-1
                     rounded-full bg-[var(--pink)] text-white text-[10px]
                     font-semibold flex items-center justify-center shadow"
                    aria-label={`Összehasonlítás ${count} tétel`}
                >
                    {label}
                </span>
            )}
        </div>
    )
}
