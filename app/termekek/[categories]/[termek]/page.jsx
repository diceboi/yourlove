"use client";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/app/components/UI/Breadcrumbs";
import Image from "next/image";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import UpsaleProducts from "@/app/components/UpsaleProducts";
import ProductInfoPanel from "@/app/components/ProductInfoPanel";

export default function page() {

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col lg:gap-8 gap-4">
        <Breadcrumbs />
        <div className=" flex lg:flex-row flex-col lg:gap-8 gap-4 ">
          <div className="flex lg:flex-row flex-col lg:gap-32 gap-8 w-full">
            <div className="flex flex-col lg:gap-16 gap-8 lg:w-2/3 w-full">
              <div className="flex lg:flex-row flex-col-reverse gap-4 w-full">
                <div className="flex lg:flex-col flex-wrap gap-2">
                  <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src="/termekkepek/2.jpg"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                  <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src="/termekkepek/2.jpg"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                  <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src="/termekkepek/2.jpg"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                  <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src="/termekkepek/2.jpg"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                  <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src="/termekkepek/2.jpg"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                  <div className="relative lg:w-[75px] lg:h-[75px] w-[50px] h-[50px] border border-[var(--border)] hover:border-[var(--black)] rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src="/termekkepek/2.jpg"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      alt="123"
                    />
                  </div>
                </div>
                <div className="relative w-full lg:h-[70vh] h-[40vh]">
                  <Image
                    src="/termekkepek/1.jpg"
                    fill
                    style={{ objectFit: "contain", objectPosition: "center" }}
                    alt="123"
                  />
                </div>
              </div>
              <div className="block lg:hidden">
                  <ProductInfoPanel />
                </div>
              <div className="flex flex-col gap-4">
                <Paragraph>
                  Egy masszírozó az S-Hande márkától, amely egy tengernyi
                  élvezetet nyújt! A Ribbon Pro Red Rose 9 rezgési móddal
                  rendelkezik, amelyek a G-pont és a csikló stimulálására
                  szolgálnak. Különleges formájának és rugalmas kialakításának
                  köszönhetően a készülék egyszerre képes hüvelyi és csikló
                  stimulációt nyújtani. A szexjáték testbarát, puha szilikonból
                  készült, amely biztosítja a bőrrel való gyengéd érintkezést.
                </Paragraph>
              </div>
              <UpsaleProducts />
            </div>
            <div className="hidden lg:block relative lg:w-1/3 w-full">
              <ProductInfoPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
