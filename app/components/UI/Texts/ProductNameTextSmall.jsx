"use client"

export default function ProductNameTextSmall({children, classname}) {
  return (
    <p
    className={`font-normal text-xs tracking-normal leading-4 uppercase ${classname}`}
    >
        {children}
    </p>
  )
}