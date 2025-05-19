"use client"

export default function H1({children, classname}) {
  return (
    <h1
    className={`font-bold lg:text-7xl md:text-6xl text-5xl tracking-tight ${classname}`}
    >
        {children}
    </h1>
  )
}
