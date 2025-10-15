import MenuText from "@/app/components/UI/Texts/MenuText"
import Link from "next/link"
import Label from "@/app/components/UI/Texts/Label"

export default function ContactUsMenu() {
  return (
    <Link href="tel:+36301234567" className="flex flex-col gap-0 min-w-fit cursor-pointer">
      <MenuText classname={"min-w-fit"}>
        Hívj minket bátran!
      </MenuText>
        <Label>
            +3630 123 4567 (H-P: 8-16)
        </Label>
    </Link>
  )
}
