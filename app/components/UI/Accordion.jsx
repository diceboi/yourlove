'use client'
import { useState } from 'react'
import { TbChevronDown } from 'react-icons/tb'

export default function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between py-3 px-1 ${open ? 'bg-[var(--grey-bg)]' : ''}`}
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{title}</span>
        <TbChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <div>{children}</div>
      </div>
    </div>
  )
}
