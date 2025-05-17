import Image from "next/image"
import Paragraph from "./Paragraph"

export default function SubmenuItem({title, image}) {
  return (
    <div className="flex flex-col items-center group gap-4 cursor-pointer w-full">
        <Image src={image} width={75} height={75} className="" alt="Secondary category image"/>
        <Paragraph classname={"text-[var(--tertiary-text)] group-hover:underline group-hover:text-[var(--black)]"}>{title}</Paragraph>
    </div>
  )
}
