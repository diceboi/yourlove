import React from "react";
import WhiteButton from "./UI/WhiteButton";
import H1 from "./UI/Texts/H1";
import H2 from "./UI/Texts/H2";
import Image from "next/image";

export default function MainCta() {
  return (
    <div className="flex flex-col gap-8 w-full py-16 px-4 xl:px-12 bg-[var(--grey-bg)]">
      <div className="bg-[var(--green)] w-full rounded-2xl px-8 pt-8 overflow-hidden">
        <div className="container flex flex-row justify-between lg:w-10/12 w-full mx-auto">
          <div className="flex flex-col gap-8 items-start justify-center min-w-fit">
            <div className="flex flex-col gap-4">
              <H1>Legyél Klubtag</H1>
              <H2>az extra kedvezményekért</H2>
            </div>
            <div className="flex flex-col justify-start w-fit gap-4">
              <WhiteButton title={"Csatlakozok"} link={"/"} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
                src={"/young-man-phone.webp"}
                width={800}
                height={800}
                alt="young man watching phone"
                className="lg:max-h-[400px] max-h-[300px] w-auto min-w-[200px] mt-8 z-10"
            />
            <Image
                src={"/icons/feher-emblema.svg"}
                width={800}
                height={800}
                alt="young man watching phone"
                className="lg:h-[400px] w-auto absolute opacity-15"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
