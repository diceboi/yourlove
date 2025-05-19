"use client"

export default function ButtonText({children, classname}) {
  return (
    <p
    className={`font-bold text-sm tracking-normal group-hover:text-[var(--black)] ${classname}`}
    >
        {children}
    </p>
  )
}