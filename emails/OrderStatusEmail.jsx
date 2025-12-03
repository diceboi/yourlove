import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
  Link,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import React from "react";

function statusLabel(status) {
  switch (status) {
    case "neworder":
      return "Új rendelés";
    case "processing":
      return "Feldolgozás alatt";
    case "pending_payment":
      return "Fizetésre vár";
    case "paid":
      return "Fizetve";
    case "shipped":
      return "Kiszállítva";
    case "delivered":
      return "Futárnak átadva";
    case "cancelled":
      return "Törölve";
    default:
      return status || "Ismeretlen státusz";
  }
}

function statusDescription(status) {
  switch (status) {
    case "neworder":
      return "Rendelésed beérkezett rendszerünkbe, hamarosan feldolgozzuk.";
    case "processing":
      return "Rendelésed jelenleg feldolgozás alatt van.";
    case "pending_payment":
      return "Rendelésed fizetésre vár. Kérjük, ellenőrizd a fizetési módot.";
    case "paid":
      return "Fizetésed megérkezett, rendelésedet előkészítjük a szállításra.";
    case "shipped":
      return "Rendelésedet átadtuk a futárszolgálatnak.";
    case "delivered":
      return "Rendelésedet a futárnak átadtuk, hamarosan érkezik hozzád.";
    case "cancelled":
      return "Rendelésed törlésre került. Ha szerinted ez hiba, kérjük jelezd felénk.";
    default:
      return "Rendelésed státusza frissült.";
  }
}

/* -------------------------------------------------
   STÁTUSZ ÉRTESÍTŐ EMAIL
-------------------------------------------------- */

export default function OrderStatusEmail({
  name,
  orderId,     // rövid rendelési szám pl. 123456
  status,      // pl. "processing"
}) {
  const label = statusLabel(status);
  const desc  = statusDescription(status);

  return (
    <Html>
      <Head />
      <Preview>Rendelésed státusza frissült – #{orderId || "———"}</Preview>

      <Tailwind>
        <Body className="bg-[#f5f5f5] p-5">
          <Container className="bg-white p-6 rounded-xl font-[system-ui] max-w-xl mx-auto">

            {/* LOGÓ */}
            <Section className="text-center mb-5">
              <Img
                src="https://yourlove-six.vercel.app/yourlove-logo.svg"
                width="150"
                alt="YourLove"
                className="mx-auto mb-5"
              />
            </Section>

            {/* CÍM */}
            <Section className="text-center mb-4">
              <Heading className="text-[28px] font-bold text-[#b60c3f] m-0 mb-2">
                Rendelésed státusza frissült
              </Heading>
              <Text className="text-[16px] text-[#555] m-0">
                #{orderId || "———"}
              </Text>
            </Section>

            {/* META – Rendelés + új státusz */}
            <Section className="mt-2 mb-4">
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ borderCollapse: "collapse", fontSize: "16px" }}
              >
                <tbody>
                  <tr>
                    <td style={{ color: "#767676", padding: "2px 0" }}>
                      Rendelés azonosító:
                    </td>
                    <td
                      style={{
                        color: "#111111",
                        padding: "2px 0",
                        textAlign: "right",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{orderId || "———"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#767676", padding: "2px 0" }}>
                      Jelenlegi státusz:
                    </td>
                    <td
                      style={{
                        color: "#b60c3f",
                        padding: "2px 0",
                        textAlign: "right",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* ÜZENET BLOKK */}
            <Section className="mt-2 mb-4">
              <Text className="text-[14px] leading-5 text-[#484848] m-0">
                Kedves {name || "Vásárló"},<br /><br />
                tájékoztatunk, hogy a(z) <strong>#{orderId || "———"}</strong> számú
                rendelésed státusza az alábbira változott:
              </Text>

              <Text className="text-[18px] font-bold text-[#111] mt-4 mb-1">
                {label}
              </Text>

              <Text className="text-[14px] leading-5 text-[#484848] m-0">
                {desc}
              </Text>
            </Section>

            {/* VÉGÜZENET */}
            <Section className="mt-5 mb-5">
              <Text className="text-[14px] leading-5 text-[#484848] m-0">
                Rendelésed részleteit bármikor megtekintheted, ha bejelentkezel a
                fiókodba, majd a <strong>„Rendeléseim”</strong> menüpontra kattintasz.
              </Text>
            </Section>

            {/* FOOTER – ugyanaz a stílus, mint a visszaigazolásnál */}
            <Section className="mt-7 pt-6 border-t border-[#dfdfdf] text-center">
              <div className="flex justify-center gap-3 mb-3">
                <Link href="https://instagram.com" className="no-underline">
                  <span className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-[14px] font-bold">
                    IG
                  </span>
                </Link>
                <Link href="https://tiktok.com" className="no-underline">
                  <span className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-[14px] font-bold">
                    TT
                  </span>
                </Link>
                <Link href="https://facebook.com" className="no-underline">
                  <span className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-[14px] font-bold">
                    f
                  </span>
                </Link>
              </div>

              <Text className="text-[12px] leading-[18px] text-[#767676] m-0">
                Ha kérdésed van, egyszerűen válaszolj erre az üzenetre, és
                hamarosan felvesszük veled a kapcsolatot 🙌
              </Text>

              <Text className="text-[12px] leading-[18px] text-[#767676] m-0">
                YourLove Kft. – 1111 Budapest, Szerelem utca 12.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/* --------------------------------------------------
   DUMMY PREVIEW
-------------------------------------------------- */

export function OrderStatusEmailPreview() {
  return (
    <OrderStatusEmail
      name="Szász Szabolcs"
      orderId={123456}
      status="processing"
    />
  );
}
