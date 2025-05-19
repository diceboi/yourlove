"use client"

export default function H2({children, classname}) {
  return (
    <h2
    className={`font-bold lg:text-4xl md:text-3xl text-2xl tracking-normal ${classname}`}
    >
        {children}
    </h2>
  )
}
