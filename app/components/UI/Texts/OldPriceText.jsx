"use client"

export default function OldPriceText({children}) {
  return (
    <p
    className={`font-regular text-lg text-[var(--tertiary-text)] line-through tracking-normal leading-4`}
    >
        {children}
    </p>
  )
}