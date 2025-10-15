'use client'
import { TbAdjustments } from 'react-icons/tb'
import { useFilterDrawer } from './FilterDrawerProvider'

export default function FilterToggleButton({ className = '' }) {
  const { openFn } = useFilterDrawer()
  return (
    <button
      onClick={openFn}
      className={`inline-flex items-center gap-2 px-4 h-10 rounded-full border bg-white hover:bg-gray-50 ${className}`}
      aria-label="Szűrők megnyitása"
    >
      <TbAdjustments className="w-5 h-5" />
      <span>Szűrők</span>
    </button>
  )
}
