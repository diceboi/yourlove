import Image from "next/image"
import Paragraph from "./Texts/Paragraph"
import Link from "next/link"

export default function SubmenuItem({title, image}) {
  return (
    <Link href={"/termekek/ferfiaknak/1"} className="flex flex-col items-center group gap-4 cursor-pointer w-full">
        <Image src={image} width={75} height={75} className="" alt="Secondary category image"/>
        <Paragraph classname={"text-[var(--tertiary-text)] group-hover:underline group-hover:text-[var(--black)]"}>{title}</Paragraph>
    </Link>
  )
}
