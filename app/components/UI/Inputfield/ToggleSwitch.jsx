'use client'

import { motion } from 'framer-motion'
import Paragraph from '@/app/components/UI/Texts/Paragraph'

export default function ToggleSwitch({
  legend,
  checked = false,
  onChange,
  classname = "",
  firstlabel,
  secondlabel
}) {
  return (
    <fieldset className={`flex flex-col h-fit ${classname}`}>
      {legend && (
        <legend className="px-2 py-0.5 mb-[1px] text-xs font-bold border-b border-[var(--border)] bg-white rounded-t-lg">
          {legend}
        </legend>
      )}
      <div className="flex items-center justify-between rounded-lg p-1 text-sm font-semibold gap-2">
        <p className='text-xs'>{firstlabel}</p>
        
        <div
          className={`w-12 h-[22px] rounded-full cursor-pointer relative shadow-inner ${checked ? 'bg-[#99fe3480]' : 'bg-[#3499fe81]'}`}
          onClick={() => onChange(!checked)}
        >
          <motion.div
            layout
            className="w-4 h-4 rounded-full shadow-md absolute top-[2.75px]"
            style={{
              marginLeft: checked ? "28px" : "3px"
            }}
            animate={{
                backgroundColor: checked ? '#9ec775' : '#3499fe'
            }}
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
          />
        </div>

        <p className='text-xs'>{secondlabel}</p>
      </div>
    </fieldset>
  )
}
