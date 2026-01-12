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
    Button,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import React from "react";

/* -------------------------------------------------
   ELHAGYOTT KOSÁR EMLÉKEZTETŐ EMAIL
-------------------------------------------------- */

export default function AbandonedCartEmail({
    name,
    items = [],
    total,
    couponCode,
    couponDiscount,
    cartUrl = "https://yourlove.hu/kosar",
}) {
    const safeTotal =
        typeof total === "number"
            ? total
            : items.reduce((sum, it) => sum + it.price * it.qty, 0);

    const finalTotal = couponCode && couponDiscount
        ? Math.max(0, safeTotal - couponDiscount)
        : safeTotal;

    return (
        <Html>
            <Head />
            <Preview>Ne felejts el vásárolni! A kosaradban vár {items.length} termék 🛍️</Preview>

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
                                Hé, {name || "Kedves Vásárló"}! 👋
                            </Heading>
                            <Text className="text-[18px] text-[#555] m-0">
                                Észrevettük, hogy hagytál valamit a kosaradban...
                            </Text>
                        </Section>

                        {/* ÜZENET */}
                        <Section className="mt-4 mb-5">
                            <Text className="text-[16px] leading-6 text-[#484848] m-0">
                                Ne aggódj, megőriztük neked! A következő termékek várnak rád a kosaradban:
                            </Text>
                        </Section>

                        {/* TERMÉKLISTA */}
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

                                        {/* Kupon kedvezmény sor */}
                                        {couponCode && couponDiscount > 0 && (
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px 4px 0 0",
                                                        fontSize: "16px",
                                                        fontWeight: 600,
                                                        color: "#9ec775",
                                                    }}
                                                >
                                                    Kupon ({couponCode})
                                                </td>
                                                <td style={{ paddingTop: "8px" }} />
                                                <td
                                                    style={{
                                                        padding: "8px 0 0 4px",
                                                        fontSize: "16px",
                                                        fontWeight: 600,
                                                        textAlign: "right",
                                                        color: "#9ec775",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    -{Number(couponDiscount).toLocaleString("hu-HU")} Ft
                                                </td>
                                            </tr>
                                        )}

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
                                                {Number(finalTotal).toLocaleString("hu-HU")} Ft
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Section>
                        )}

                        {/* CTA GOMB */}
                        <Section className="text-center mt-6 mb-5">
                            <Button
                                href={cartUrl}
                                style={{
                                    background: "#b60c3f",
                                    color: "#ffffff",
                                    padding: "14px 32px",
                                    borderRadius: "50px",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    display: "inline-block",
                                }}
                            >
                                Vissza a kosárhoz 🛍️
                            </Button>
                        </Section>

                        {/* TOVÁBBI ÜZENET */}
                        <Section className="mt-5 mb-5">
                            <Text className="text-[14px] leading-5 text-[#484848] m-0 text-center">
                                Ne hagyd, hogy elszalaszd! Termékeinket gyorsan elkapkodják. 💖
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

export function AbandonedCartEmailPreview() {
    return (
        <AbandonedCartEmail
            name="Szász Szabolcs"
            items={dummyItems}
            total={dummyTotal}
            couponCode="WELCOME10"
            couponDiscount={2097}
            cartUrl="https://yourlove.hu/kosar"
        />
    );
}
