"use client"

export default function Label({children, classname}) {
  return (
    <label
    className={`text-xs tracking-normal ${classname}`}
    >
        {children}
    </label>
  )
}
