"use client"

export default function BlogTitleText({children, classname}) {
  return (
    <p
    className={`font-bold text-sm tracking-normal ${classname}`}
    >
        {children}
    </p>
  )
}