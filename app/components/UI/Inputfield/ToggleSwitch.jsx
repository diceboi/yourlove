'use client'

import { motion } from 'framer-motion'
import Paragraph from '@/app/components/UI/Texts/Paragraph'

export default function ToggleSwitch({
  legend,
  checked = false,
  onChange,
  classname = "",
}) {
  return (
    <fieldset className={`flex flex-col h-fit ${classname}`}>
      {legend && (
        <legend className="px-2 py-0.5 mb-[1px] text-xs font-bold border-b border-[var(--border)] bg-white rounded-t-lg">
          {legend}
        </legend>
      )}
      <div className="flex items-center justify-between border border-[var(--border)] rounded-lg p-2 text-sm font-semibold gap-2">
        <Paragraph>Vázlat</Paragraph>
        
        <div
          className={`w-12 h-[25px] rounded-full cursor-pointer relative shadow-inner ${checked ? 'bg-[#99fe3480]' : 'bg-[#3499fe81]'}`}
          onClick={() => onChange(!checked)}
        >
          <motion.div
            layout
            className="w-5 h-5 rounded-full shadow-md absolute top-[2.75px]"
            style={{
              marginLeft: checked ? "24px" : "3px"
            }}
            animate={{
                backgroundColor: checked ? '#9ec775' : '#3499fe'
            }}
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
          />
        </div>

        <Paragraph>Közzétéve</Paragraph>
      </div>
    </fieldset>
  )
}
