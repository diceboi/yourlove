"use client";

import { useState } from "react";
import Label from "@/app/components/UI/Texts/Label"
import Image from "next/image"
import Link from "next/link"
import Paragraph from "@/app/components/UI/Texts/Paragraph"
import { TbBrandFacebook, TbBrandYoutube, TbBrandTiktok } from "react-icons/tb"
import ButtonText from "@/app/components/UI/Texts/ButtonText"
import NewsletterFooterBox from "./UI/NewsletterFooterBox"
import CookieSettings from "./CookieSettings"

export default function Footer() {
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col w-full min-h-[30vh]">
        <div className="flex lg:flex-row flex-col gap-8 pt-8 pb-8 px-4 xl:px-12 bg-[var(--border)]">
          <div className="flex flex-col gap-8 lg:w-1/3 w-full">
            <Image src="/yourlove-logo.svg" alt="Yourlove logo" width={200} height={100} className="w-[200px] h-auto" />
            <div className="flex flex-col gap-1">
              <Paragraph classname={"font-bold"}>Telefonszám: <Link className="underline text-[var(--pink)]" href="tel:+36301234567">+36 30 123 4567</Link></Paragraph>
              <Paragraph classname={"font-bold"}>E-mail cím: <Link className="underline text-[var(--pink)]" href="mailto:info@yourlove.hu">info@yourlove.hu</Link></Paragraph>
            </div>
            <div className="flex flex-row gap-1">
              <TbBrandYoutube className="w-7 h-7 text-[var(--black)] bg-[var(--green)] rounded-full p-1"/>
              <TbBrandTiktok className="w-7 h-7 text-[var(--black)] bg-[var(--green)] rounded-full p-1"/>
              <TbBrandFacebook className="w-7 h-7 text-[var(--black)] bg-[var(--green)] rounded-full p-1"/>
            </div>
          </div>
          <div className="flex lg:flex-row flex-col gap-8 lg:w-1/3 w-full">
            <div className="flex flex-col gap-4 w-full">
              <Paragraph classname={"font-bold text-[var(--pink)]"}>Gyors elérés</Paragraph>
              <div className="flex flex-col gap-2">
                <ButtonText><Link href="/termekek" className="hover:underline">Termékek</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Nőknek</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Férfiaknak</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Páros</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Blog</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Gyik</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Rólunk</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Kapcsolat</Link></ButtonText>
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <Paragraph classname={"font-bold text-[var(--pink)]"}>Hasznos linkek</Paragraph>
              <div className="flex flex-col gap-2">
                <ButtonText><Link href="/termekek" className="hover:underline">Adatkezelési tájékoztató</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">ÁSZF</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Vásárlási feltételek</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Elállás</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Szállítás</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Fizetés</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Diszkrét csomagolás</Link></ButtonText>
                <ButtonText><Link href="/termekek" className="hover:underline">Fontos tudnivalók a termékekről</Link></ButtonText>
                <ButtonText>
                  <button 
                    onClick={() => setIsCookieSettingsOpen(true)}
                    className="hover:underline text-left"
                  >
                    Süti beállítások
                  </button>
                </ButtonText>
              </div>
            </div>
          </div>
          <div id="hirlevel">
            <NewsletterFooterBox />
          </div>
        </div>
        <div className="flex lg:flex-row flex-col gap-8 items-center justify-between pt-8 pb-8 px-4 xl:px-12 bg-[var(--border)]/70">
            <Label classname={"min-w-fit"}>© 2025 Yourlove | Online erotikus shop</Label>
            <Link href="/fizetes"><Image src="/simplepay_bankcard_logos_left_482x40_new.png" alt="SimplePay logos" width={1000} height={167} className="w-[400px] h-auto" /></Link>
            <Label classname={"flex flex-nowrap gap-1 min-w-fit"}>Made with <Image src="/yourlove-icon.svg" alt="Yourlove icon" width={15} height={15} /> by: <Link className="underline" href="mailto:szasz.szabolcs1995@gmail.com">Szász Szabolcs</Link></Label>
        </div>
        
        {/* Cookie Settings Modal */}
        <CookieSettings 
          isOpen={isCookieSettingsOpen}
          onClose={() => setIsCookieSettingsOpen(false)}
        />
    </div>
  )
}
