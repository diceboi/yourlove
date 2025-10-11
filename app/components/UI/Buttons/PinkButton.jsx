import * as TablerIcons from 'react-icons/tb'
import Button from './Button'

export default function PinkButton({ title, link, onclick, buttonicon }) {
  const IconComponent = buttonicon && TablerIcons[buttonicon] ? TablerIcons[buttonicon] : null
  const safeOnClick = typeof onclick === 'function' ? onclick : undefined

  return (
    <Button
      title={title}
      link={link}
      titlecolor="text-white"
      hovertitlecolor="group-hover:text-white"
      bgcolor="bg-[var(--pink)]"
      bordercolor=""
      hoverbgcolor="hover:bg-[var(--pink-hover)]"
      onclick={safeOnClick}
      beforeicon={null}
      aftericon={IconComponent ? <IconComponent className="text-white w-5 h-5" /> : null}
    />
  )
}
