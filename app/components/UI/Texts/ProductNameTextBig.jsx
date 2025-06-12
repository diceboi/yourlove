"use client"

export default function ProductNameText({children, classname}) {
  return (
    <p
    className={`font-bold text-2xl tracking-normal leading-4 uppercase ${classname}`}
    >
        {children}
    </p>
  )
}