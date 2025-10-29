import PopularProducts from '@/app/components/PopularProducts'
import Breadcrumbs from '@/app/components/UI/Breadcrumbs'
import H1 from '@/app/components/UI/Texts/H1'
import H2 from '@/app/components/UI/Texts/H2'
import H3 from '@/app/components/UI/Texts/H3'
import Paragraph from '@/app/components/UI/Texts/Paragraph'
import React from 'react'
import GyikAnimation from '@/app/components/UI/Animations/GyikAnimation'

export const metadata = {
  title: 'GYIK – Gyakran Ismételt Kérdések | YourLove',
  description:
    'Válaszok általános webshop kérdésekre, szállításra, fizetésre, visszaküldésre és adatvédelemre. Külön GYIK erotikus témájú webshop vásárlóinak.',
}

const generalFaq = [
  {
    q: 'Hogyan adhatok le rendelést?',
    a: 'Válaszd ki a terméket, tedd a kosárba, majd a pénztár oldalon add meg a szállítási és számlázási adatokat, válaszd ki a fizetési módot és erősítsd meg a rendelést.',
  },
  {
    q: 'Milyen fizetési módokat fogadtok el?',
    a: 'Bankkártya, online fizetési szolgáltató (pl. SimplePay/Barion/PayPal – ahol elérhető), előreutalás, illetve utánvét a futárnál vagy csomagponton, ha támogatott.',
  },
  {
    q: 'Mennyi a szállítási idő?',
    a: 'Raktáron lévő termékeknél általában 1–3 munkanap belföldön. Előrendelésnél vagy külső raktárnál a visszaigazolásban jelzett határidő érvényes.',
  },
  {
    q: 'Hogyan követhetem a rendelésem?',
    a: 'A feladás után e-mailben vagy SMS-ben küldünk csomagkövetési számot és linket. Regisztrált felhasználók a fiókban is nyomon tudják követni.',
  },
  {
    q: 'Visszaküldés és elállás menete?',
    a: 'Online vásárlásnál 14 naptári napon belül indoklás nélkül elállhatsz. Írj ügyfélszolgálatunknak, és megadjuk a visszaküldési címet és teendőket. A termék legyen sértetlen, eredeti csomagolásban, ahol ez lehetséges.',
  },
  {
    q: 'Mikor kapom vissza a pénzem elállás esetén?',
    a: 'A visszaérkezést és ellenőrzést követően legkésőbb 14 napon belül visszatérítjük a vételárat az eredeti fizetési módodra.',
  },
  {
    q: 'Mi a teendő, ha hibás vagy sérült terméket kaptam?',
    a: 'Kérjük, 48 órán belül jelezd fotókkal az ügyfélszolgálatunknak. Cserét vagy vételár-visszatérítést biztosítunk a vonatkozó jótállási/szavatossági szabályok szerint.',
  },
  {
    q: 'Szükséges regisztrálni a vásárláshoz?',
    a: 'Nem kötelező, vendégként is vásárolhatsz. A regisztráció előnye, hogy gyorsabb a rendelés és látható az előzmény, számlák, csomagkövetés.',
  },
  {
    q: 'Hogyan kérhetek számlát a cégem nevére?',
    a: 'A pénztár oldalon add meg a cégnevet, adószámot és a számlázási címet. Elektronikus számlát küldünk e-mailben.',
  },
  {
    q: 'Biztonságos az online fizetés?',
    a: 'Igen. Oldalunk titkosított kapcsolatot használ (HTTPS), a kártyaadatokat tanúsított fizetési szolgáltató kezeli 3-D Secure támogatással.',
  },
]

const adultFaq = [
  {
    q: 'Diszkrét-e a csomagolás?',
    a: 'Igen, minden erotikus terméket jelöletlen, diszkrét csomagolásban adunk fel. A feladó általános néven vagy cégnevünkön szerepel, termékmegnevezés nélkül.',
  },
  {
    q: 'Hogyan jelenik meg a számlán a vásárlás?',
    a: 'A számlán és a fizetési bizonylaton sem utalunk a termék jellegére. Általános megnevezéseket és cikkszámokat használunk.',
  },
  {
    q: 'Milyen higiéniai szabályokat követtek?',
    a: 'Higiéniai okokból sértetlen, bontatlan csomagolású termékeket veszünk vissza. Testközeli eszközöket felbontás után egészségvédelmi okokból nem tudunk visszavenni, kivéve ha hibásak.',
  },
  {
    q: 'Hogyan kell tisztítani és tárolni az erotikus eszközöket?',
    a: 'Mindig kövesd a gyártói útmutatót. Általánosságban: langyos víz és kímélő tisztítószer vagy speciális toy cleaner, teljes szárítás, pormentes, napfénytől védett tárolás. Szilikon eszköznél szilikon alapú síkosító kerülendő.',
  },
  {
    q: 'Mit tegyek, ha egy termék nem kompatibilis velem vagy allergiát okoz?',
    a: 'Használat előtt végezz bőrpróbát, és olvasd el az anyagösszetételt. Irritáció esetén hagyd abba a használatot és fordulj orvoshoz. Válassz hipoallergén, bőrbarát anyagú termékeket.',
  },
  {
    q: 'Van-e garancia az erotikus termékekre?',
    a: 'A műszaki eszközökre gyártói jótállás vonatkozhat. Rejtett hibánál szavatossági igény érvényesíthető. A higiéniai jellegű termékek bontás után csak hibás működés esetén cserélhetők.',
  },
  {
    q: 'Kaphatok tanácsot termékválasztáshoz?',
    a: 'Igen, ügyfélszolgálatunk diszkréten segít méretben, anyagban, funkciókban és kompatibilitásban (pl. síkosítók, kiegészítők).',
  },
  {
    q: 'Milyen korhatár vonatkozik a vásárlásra?',
    a: 'Erotikus termékeket kizárólag 18 év feletti személyek vásárolhatnak. A futár kérhet életkor-igazolást kézbesítéskor.',
    },
  {
    q: 'Hogyan biztosított a magánszféra a webáruház használatakor?',
    a: 'Adatvédelmi irányelveink szigorúak: csak a teljesítéshez szükséges adatokat kezeljük, azokat titkosított kapcsolaton kérjük be és megbízható szolgáltatókkal osztjuk meg (pl. futárszolgálat).',
  },
  {
    q: 'Milyen csatornákon kérhetek segítséget?',
    a: 'E-mailben, telefonon vagy chatben. Kérdéseidre diszkréten válaszolunk és segítünk a megfelelő termék kiválasztásában.',
  },
]

function FaqSection({ title, items, idPrefix }) {
  return (
    <section aria-labelledby={`${idPrefix}-title`} className="w-full">
      <H3 id={`${idPrefix}-title`} classname={"text-[var(--pink)] mb-4"}>{title}</H3>
      <div className="flex flex-col divide-y divide-[var(--border,#e5e7eb)] rounded-2xl border border-[var(--border,#e5e7eb)] bg-white">
        {items.map((item, idx) => {
          const id = `${idPrefix}-${idx}`
          return (
            <details key={id} className="group p-4 open:bg-[var(--muted,#fafafa)]">
              <summary
                className="cursor-pointer list-none flex justify-between items-center font-medium"
                aria-controls={`${id}-content`}
                aria-expanded="false"
              >
                <span className="pr-6">{item.q}</span>
                <span aria-hidden className="transition-transform group-open:rotate-180 text-[var(--green)]">▾</span>
              </summary>
              <div id={`${id}-content`} className="mt-3 text-[15px] leading-7">
                <p>{item.a}</p>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}

function FaqJsonLd({ sections }) {
  const mainEntity = sections
    .flatMap(s => s.items)
    .map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )
}

export default function Page() {
  const sections = [{ items: generalFaq }, { items: adultFaq }]

  return (
    <>
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
      <Breadcrumbs />
      <div className="flex flex-col gap-4 w-full my-8">
        <div className="flex flex-col items-center justify-center relative w-full xl:h-[60vh] h-[50vh] rounded-2xl xl:pt-0 pt-8">
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--grey-bg)] rounded-2xl" />
            <div className="w-full flex flex-col gap-8 items-start justify-between">
                <div className="flex flex-col items-center gap-8 z-10 w-full p-2">
                    <H1 classname="text-center text-[var(--pink)]">GYIK</H1>
                    <H2>Gyakran ismételt kérdések</H2>
                    <Paragraph classname="text-center lg:w-1/2 w-full">
                        Összegyűjtöttük a leggyakoribb kérdéseket általános webáruházas témákban és külön az erotikus termékekkel kapcsolatban.
                        A válaszok a rendelés leadásától a szállításon át az adatvédelemig segítenek eligazodni.
                    </Paragraph>
                </div>
                <div className="z-10 absolute xl:-top-0 -top-44 left-1/2 -translate-x-1/2 overflow-hidden w-[200px] h-auto">
                    <GyikAnimation/>
                </div>
            </div>
        </div>
      </div>

      <FaqJsonLd sections={sections} />
      <div className="flex flex-col gap-10">
          <FaqSection title="Általános webshop kérdések" items={generalFaq} idPrefix="general" />
          <FaqSection title="Erotikus témájú webshop kérdések" items={adultFaq} idPrefix="adult" />
        </div>
    </div>
    <PopularProducts/>
    </>
  )
}
