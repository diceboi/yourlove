"use client"

export default function H2({children, classname}) {
  return (
    <h2
    className={`font-bold xl:text-5xl md:text-4xl text-3xl tracking-tighter ${classname}`}
    >
        {children}
    </h2>
  )
}
