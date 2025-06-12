"use client"

export default function ProductNameText({children, classname}) {
  return (
    <p
    className={`font-bold text-sm tracking-normal leading-4 uppercase ${classname}`}
    >
        {children}
    </p>
  )
}