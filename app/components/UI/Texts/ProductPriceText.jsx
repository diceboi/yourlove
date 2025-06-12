"use client"

export default function ProductPriceText({children, classname, sale}) {
  return (
    <p
    className={`font-bold text-2xl tracking-normal leading-4 ${classname} ${sale ? 'px-4 py-4 bg-[var(--green)] w-fit' : ''}`}
    >
        {children}
    </p>
  )
}