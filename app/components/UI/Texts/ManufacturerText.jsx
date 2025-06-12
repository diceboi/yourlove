"use client"

export default function ManufacturerText({children, classname}) {
  return (
    <p
    className={`font-bold text-lg tracking-normal leading-4 uppercase ${classname}`}
    >
        {children}
    </p>
  )
}