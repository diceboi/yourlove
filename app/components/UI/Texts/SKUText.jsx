"use client"

export default function SKUText({children, classname}) {
  return (
    <p
    className={`text-[var(--tertiary-text)] text-xs tracking-normal ${classname}`}
    >
        Cikkszám: {children}
    </p>
  )
}