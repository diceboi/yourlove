'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ButtonText from '../Texts/ButtonText'

export default function Button({
  title,
  titlecolor,
  hovertitlecolor,
  bgcolor,
  bordercolor,
  hoverbgcolor,
  onclick,
  beforeicon,
  aftericon,
  link,
  className = '',
}) {
  const baseClass = `flex flex-nowrap group items-center justify-center gap-2 px-7 h-[44px] rounded-full min-w-fit ${bgcolor} ${hoverbgcolor} ${
    bordercolor ? `border-2 ${bordercolor} hover:${bordercolor}` : ''
  } transition-all cursor-pointer z-10 ${className}`

  // Ha NINCS onClick, de VAN link → Link-ként rendereljük
  if (!onclick && link) {
    return (
      <Link href={link} className={baseClass} aria-label={title}>
        {beforeicon}
        <ButtonText classname={`${titlecolor} ${hovertitlecolor}`}>{title}</ButtonText>
        {aftericon}
      </Link>
    )
  }

  // Ha VAN onClick → <button>; ha nincs, de van link, fallback-ként router.push(link)
  const router = useRouter()
  const handleClick = (e) => {
    if (typeof onclick === 'function') {
      onclick(e)
      return
    }
    if (link) router.push(link)
  }

  return (
    <button type="button" onClick={handleClick} className={baseClass} aria-label={title}>
      {beforeicon}
      <ButtonText classname={`${titlecolor} ${hovertitlecolor}`}>{title}</ButtonText>
      {aftericon}
    </button>
  )
}
