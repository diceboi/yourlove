"use client"

export default function H2({children, classname, style}) {
  return (
    <h2
    className={`font-bold lg:text-4xl md:text-3xl text-2xl tracking-normal ${classname}`}
    style={style}
    >
        {children}
    </h2>
  )
}
