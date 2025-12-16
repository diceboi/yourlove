"use client"

export default function Paragraph({children, classname, style}) {
  return (
    <p
    className={`text-sm tracking-normal leading-5 ${classname}`}
    style={style}
    >
        {children}
    </p>
  )
}