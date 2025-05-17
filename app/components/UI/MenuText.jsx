"use client"

export default function Paragraph({children, classname}) {
  return (
    <p
    className={`font-bold text-sm tracking-normal text-[var(--tertiary-text)] group-hover:text-[var(--black)] ${classname}`}
    >
        {children}
    </p>
  )
}