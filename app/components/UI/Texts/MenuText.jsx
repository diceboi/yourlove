"use client"

export default function MenuText({children, classname}) {
  return (
    <p
    className={`font-bold text-sm tracking-normal group-hover:text-[var(--pink)] ${classname}`}
    >
        {children}
    </p>
  )
}