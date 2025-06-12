"use client"

export default function ProductPriceTextSmall({children, classname, sale}) {
  return (
    <p
    className={`font-normal text-[var(--green)] text-xs tracking-normal leading-4 ${classname}`}
    >
        {children}
    </p>
  )
}