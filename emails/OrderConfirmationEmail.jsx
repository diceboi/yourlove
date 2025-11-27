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

/* -------------------------------------------------
   ÉLES EMAIL TEMPLATE – csak struktúra, props-ból
-------------------------------------------------- */

export default function OrderConfirmationEmail({
  name,
  orderId,
  items = [],
  total,
  orderDate,
  billingName,
  billingZip,
  billingCity,
  billingAddress,
  shippingMethod,
  shippingZip,
  shippingCity,
  shippingAddress,
  wantsInvoice,
  companyName,
  companyTaxNumber,
}) {
  const safeTotal =
    typeof total === "number"
      ? total
      : items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return (
    <Html>
      <Head />
      <Preview>Köszönjük rendelésed – #{orderId || "———"}</Preview>

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
              <Heading className="text-[32px] font-bold text-[#b60c3f] m-0 mb-3">
                Köszönjük a rendelésed, {name || "Kedves Vásárló"}!
              </Heading>
            </Section>

            {/* Rendelés meta – TÁBLÁZATTAL, hogy Gmailben is stabil legyen */}
            <Section className="mt-2 mb-2">
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

                  {orderDate && (
                    <tr>
                      <td style={{ color: "#767676", padding: "2px 0" }}>
                        Rendelés dátuma:
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
                        {orderDate}
                      </td>
                    </tr>
                  )}

                  {shippingMethod && (
                    <tr>
                      <td style={{ color: "#767676", padding: "2px 0" }}>
                        Szállítási mód:
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
                        {shippingMethod}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            {/* TERMÉKLISTA – szintén TÁBLÁZATTAL */}
            {items.length > 0 && (
              <Section className="mt-5">
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ borderCollapse: "collapse", fontSize: "16px" }}
                >
                  <tbody>
                    {items.map((it, index) => (
                      <tr
                        key={it.id || index}
                        style={{
                          borderTop: "1px solid #dfdfdf",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 4px 8px 0",
                            color: "#111111",
                            fontWeight: 600,
                          }}
                        >
                          {it.name}
                        </td>
                        <td
                          style={{
                            padding: "8px 4px",
                            color: "#111111",
                            fontWeight: 600,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {it.qty} db
                        </td>
                        <td
                          style={{
                            padding: "8px 0 8px 4px",
                            color: "#b60c3f",
                            fontWeight: 600,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {Number(it.price).toLocaleString("hu-HU")} Ft
                        </td>
                      </tr>
                    ))}

                    {/* Zöld elválasztó */}
                    <tr>
                      <td colSpan={3} style={{ padding: "0", height: "1px" }}>
                        <Hr
                          className="mb-3 border border-[#9ec775]"
                          style={{ margin: 0, borderColor: "#9ec775" }}
                        />
                      </td>
                    </tr>

                    {/* Összesen sor */}
                    <tr>
                      <td
                        style={{
                          padding: "8px 4px 0 0",
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#111111",
                        }}
                      >
                        Összesen
                      </td>
                      <td style={{ paddingTop: "8px" }} />
                      <td
                        style={{
                          padding: "8px 0 0 4px",
                          fontSize: "20px",
                          fontWeight: 700,
                          textAlign: "right",
                          color: "#b60c3f",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {Number(safeTotal).toLocaleString("hu-HU")} Ft
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            )}

            {/* SZÁMLÁZÁSI ADATOK */}
            <Section className="mt-4 mb-5">
              <Heading className="text-[16px] font-semibold text-[#111] m-0 mb-2">
                Számlázási adatok
              </Heading>
              <Text className="text-[14px] leading-5 text-[#484848] m-0">
                {/* Cégnév / adószám – csak ha megadta */}
                {wantsInvoice && companyName && (
                  <>
                    {companyName}
                    <br />
                  </>
                )}
                {wantsInvoice && companyTaxNumber && (
                  <>
                    Adószám: {companyTaxNumber}
                    <br />
                  </>
                )}

                {/* Név + cím */}
                {billingName && (
                  <>
                    {billingName}
                    <br />
                  </>
                )}
                {(billingZip || billingCity) && (
                  <>
                    {billingZip} {billingCity}
                    <br />
                  </>
                )}
                {billingAddress}
              </Text>
            </Section>

            {/* SZÁLLÍTÁSI ADATOK */}
            <Section className="mt-8 mb-5">
              <Heading className="text-[16px] font-semibold text-[#111] m-0 mb-2">
                Szállítási adatok
              </Heading>
              <Text className="text-[14px] leading-5 text-[#484848] m-0">
                {billingName && (
                  <>
                    {billingName}
                    <br />
                  </>
                )}
                {(shippingZip || shippingCity) && (
                  <>
                    {shippingZip} {shippingCity}
                    <br />
                  </>
                )}
                {shippingAddress}
              </Text>
            </Section>

            {/* Megtekintés info */}
            <Section className="mt-5 mb-5">
              <Text className="text-[14px] leading-5 text-[#484848] m-0">
                Rendelésedet bármikor megtekintheted, ha bejelentkezel a
                fiókodba, majd a <strong>„Rendeléseim”</strong> menüpontra
                kattintasz.
              </Text>
            </Section>

            {/* FOOTER */}
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
   DUMMY PREVIEW VERZIÓ
-------------------------------------------------- */

const dummyItems = [
  {
    id: "item-1",
    name: "Luxus vibrátor – rózsaszín",
    qty: 1,
    price: 14990,
  },
  {
    id: "item-2",
    name: "Síkosító (100 ml)",
    qty: 2,
    price: 2990,
  },
];

const dummyTotal = dummyItems.reduce(
  (sum, it) => sum + it.price * it.qty,
  0
);

export function OrderConfirmationEmailPreview() {
  return (
    <OrderConfirmationEmail
      name="Szász Szabolcs"
      orderId={123456}
      orderDate="2025. 02. 20. 14:32"
      shippingMethod="GLS házhozszállítás"
      billingName="Kiss Anna"
      billingZip="1111"
      billingCity="Budapest"
      billingAddress="Szerelmem utca 12. 4/15"
      shippingZip="7400"
      shippingCity="Kaposvár"
      shippingAddress="Egyenes út 101."
      items={dummyItems}
      total={dummyTotal}
      wantsInvoice={true}
      companyName="YourLove Kft."
      companyTaxNumber="12345678-1-12"
    />
  );
}
