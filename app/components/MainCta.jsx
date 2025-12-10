import React from "react";
import WhiteButton from "./UI/WhiteButton";
import H1 from "./UI/Texts/H1";
import Paragraph from "./UI/Texts/Paragraph";
import Image from "next/image";
import { TbCrown } from "react-icons/tb";

export default function MainCta() {
  return (
      <div className="bg-[var(--green)] w-full rounded-2xl px-8 pt-8 overflow-hidden my-16">
        <div className="container flex flex-col lg:flex-row justify-between items-center lg:w-10/12 w-full mx-auto gap-8">
          
          <div className="flex flex-col gap-6 items-start justify-center lg:w-1/2 z-20 pb-8 lg:pb-0">
             <div className="flex items-center gap-3">
                <H1 classname="text-[var(--black)]">YourLove Klub</H1>
             </div>
             
             <Paragraph classname="text-[var(--black)] text-lg">
                Lépj be exkluzív klubunkba és élvezd a kiváltságokat!
             </Paragraph>

             <ul className="space-y-3 text-white">
                <li className="flex items-center gap-2 text-lg">
                  <span className="font-bold text-[var(--pink)]">✓</span> Állandó 5% kedvezmény minden teljes árú termékből
                </li>
                <li className="flex items-center gap-2 text-lg">
                  <span className="font-bold text-[var(--pink)]">✓</span> Elsőbbségi kiszállítás
                </li>
                <li className="flex items-center gap-2 text-lg">
                  <span className="font-bold text-[var(--pink)]">✓</span> Titkos akciók csak tagoknak
                </li>
             </ul>

            <div className="flex flex-col justify-start w-fit mt-4">
              <WhiteButton title={"Csatlakozom a klubhoz"} link={"/regisztracio"} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-end relative lg:w-1/2 h-full">
            <Image
                src={"/young-man-phone.webp"}
                width={800}
                height={800}
                alt="happy club member"
                className="lg:max-h-[450px] max-h-[350px] w-auto object-contain z-10"
            />
            <Image
                src={"/icons/feher-emblema.svg"}
                width={800}
                height={800}
                alt="logo watermark"
                className="lg:h-[500px] w-auto absolute bottom-0 right-0 opacity-10 translate-x-1/4 translate-y-1/4"
            />
          </div>
        </div>
      </div>
  );
}
