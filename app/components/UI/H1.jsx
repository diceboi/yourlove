"use client"

export default function H1({children, classname}) {
  return (
    <h1
    className={`font-bold xl:text-7xl md:text-6xl text-5xl tracking-tighter ${classname}`}
    >
        {children}
    </h1>
  )
}
