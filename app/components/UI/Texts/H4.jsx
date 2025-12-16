"use client"

export default function H4({children, classname, style}) {
  return (
    <h4
    className={`font-bold xl:text-2xl md:text-2xl text-xl tracking-tighter ${classname}`}
    style={style}
    >
        {children}
    </h4>
  )
}
