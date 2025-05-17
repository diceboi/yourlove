"use client"

export default function H3({children, classname}) {
  return (
    <h3
    className={`font-semibold xl:text-3xl md:text-3xl text-2xl tracking-tight leading-tight ${classname}`}
    >
        {children}
    </h3>
  )
}
