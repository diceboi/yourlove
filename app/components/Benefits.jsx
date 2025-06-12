import Image from "next/image";
import Paragraph from "./UI/Texts/Paragraph";

export default function Benefits() {
  return (
    <div className="w-full xl:py-8 py-4 px-4 xl:px-12">
      <div className="grid xl:grid-cols-6 lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 lg:items-center justify-start">
            <Image src={"/icons/diszkret.svg"} width={50} height={50} alt={"diszkret"} className="lg:h-[50px] h-[40px] w-auto" />
            <Paragraph classname={"text-[var(--secondary-text)] text-center"}>Diszkrét<br></br>csomagolás</Paragraph>
        </div>
        <div className="flex flex-col gap-2 items-center justify-start">
            <Image src={"/icons/penzvisszafizetes.svg"} width={50} height={50} alt={"diszkret"} className="lg:h-[50px] h-[40px] w-auto" />
            <Paragraph classname={"text-[var(--secondary-text)] text-center"}>30 napos pénzvisszafizetési garancia</Paragraph>
        </div>
        <div className="flex flex-col gap-2 items-center justify-start">
            <Image src={"/icons/diszkret.svg"} width={50} height={50} alt={"diszkret"} className="lg:h-[50px] h-[40px] w-auto" />
            <Paragraph classname={"text-[var(--secondary-text)] text-center"}>Diszkrét csomagolás</Paragraph>
        </div>
        <div className="flex flex-col gap-2 items-center justify-start">
            <Image src={"/icons/penzvisszafizetes.svg"} width={50} height={50} alt={"diszkret"} className="lg:h-[50px] h-[40px] w-auto" />
            <Paragraph classname={"text-[var(--secondary-text)] text-center"}>30 napos pénzvisszafizetési garancia</Paragraph>
        </div>
        <div className="flex flex-col gap-2 items-center justify-start">
            <Image src={"/icons/diszkret.svg"} width={50} height={50} alt={"diszkret"} className="lg:h-[50px] h-[40px] w-auto" />
            <Paragraph classname={"text-[var(--secondary-text)] text-center"}>Diszkrét csomagolás</Paragraph>
        </div>
        <div className="flex flex-col gap-2 items-center justify-start">
            <Image src={"/icons/penzvisszafizetes.svg"} width={50} height={50} alt={"diszkret"} className="lg:h-[50px] h-[40px] w-auto" />
            <Paragraph classname={"text-[var(--secondary-text)] text-center"}>30 napos pénzvisszafizetési garancia</Paragraph>
        </div>
      </div>
    </div>
  );
}
