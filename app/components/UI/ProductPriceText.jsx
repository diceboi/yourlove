"use client"

export default function ProductPriceText({children, classname}) {
  return (
    <p
    className={`font-bold text-2xl tracking-normal leading-4 ${classname}`}
    >
        {children}
    </p>
  )
}