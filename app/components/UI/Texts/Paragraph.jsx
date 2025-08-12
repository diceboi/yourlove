"use client"

export default function Paragraph({children, classname}) {
  return (
    <p
    className={`text-sm tracking-normal leading-5 ${classname}`}
    >
        {children}
    </p>
  )
}