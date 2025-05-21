"use client"

export default function H3({children, classname}) {
  return (
    <h3
    className={`font-semibold text-2xl tracking-normal leading-tight ${classname}`}
    >
        {children}
    </h3>
  )
}
