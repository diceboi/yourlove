"use client"

export default function H4({children, classname}) {
  return (
    <h4
    className={`font-bold xl:text-2xl md:text-2xl text-xl tracking-tighter ${classname}`}
    >
        {children}
    </h4>
  )
}
