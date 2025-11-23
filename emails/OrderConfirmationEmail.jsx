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

export default function OrderConfirmationEmail({
  name,               // pl. "Kiss Anna"
  orderId,            // pl. 123
  items = [],         // [{ id, name, qty, price }]
  total,              // pl. 8190
  orderDate,          // pl. "2025. 02. 20. 14:32"
  billingName,        // pl. "Kiss Anna"
  billingZip,         // pl. "1111"
  billingCity,        // pl. "Budapest"
  billingAddress,     // pl. "Szerelem utca 12. 4/15"
  shippingMethod,     // pl. "GLS házhozszállítás"
}) {
  return (
    <Html>
      <Head />
      <Preview>Köszönjük rendelésed – #{orderId}</Preview>

      <Body style={main}>
        <Container style={container}>
          {/* LOGÓ */}
          <Img
            src="https://yourlove-six.vercel.app/yourlove-logo.svg"
            width="120"
            alt="YourLove"
            style={{ margin: "0 auto 20px" }}
          />

          {/* CÍM */}
          <Heading style={h1}>Köszönjük a rendelésed, {name}!</Heading>

          {/* Rendelés meta adatok */}
          <Section style={infoSection}>
            <Text style={labelRow}>
              <span>Rendelés azonosító:</span>
              <strong>#{orderId}</strong>
            </Text>
            {orderDate && (
              <Text style={labelRow}>
                <span>Rendelés dátuma:</span>
                <strong>{orderDate}</strong>
              </Text>
            )}
            {shippingMethod && (
              <Text style={labelRow}>
                <span>Szállítási mód:</span>
                <strong>{shippingMethod}</strong>
              </Text>
            )}
          </Section>

          {/* TERMÉKLISTA */}
          {items.length > 0 && (
            <Section style={box}>
              {items.map((it) => (
                <div key={it.id} style={itemRow}>
                  <span>{it.name}</span>
                  <span>{it.qty} db</span>
                  <span>{it.price.toLocaleString("hu-HU")} Ft</span>
                </div>
              ))}
              <Hr />
              <div style={{ ...itemRow, fontWeight: "bold" }}>
                <span>Összesen</span>
                <span></span>
                <span>{total.toLocaleString("hu-HU")} Ft</span>
              </div>
            </Section>
          )}

          {/* Számlázási adatok */}
          <Section style={box}>
            <Heading as="h2" style={h2}>
              Számlázási adatok
            </Heading>
            <Text style={text}>
              {billingName && <>{billingName}<br /></>}
              {billingZip && billingCity && (
                <>
                  {billingZip} {billingCity}
                  <br />
                </>
              )}
              {billingAddress && <>{billingAddress}</>}
            </Text>
          </Section>

          {/* Info a rendelés megtekintéséről */}
          <Section style={box}>
            <Text style={text}>
              Rendelésedet bármikor megtekintheted, ha bejelentkezel a
              fiókodba, majd a <strong>„Rendeléseim”</strong> menüpontra
              kattintasz.
            </Text>
          </Section>

          {/* --- FOOTER --- */}
          <Section style={footerSection}>
            {/* Social ikon sor */}
            <div style={socialRow}>
              <Link href="https://instagram.com" style={iconLink}>
                <span style={iconCircle}>IG</span>
              </Link>
              <Link href="https://tiktok.com" style={iconLink}>
                <span style={iconCircle}>TT</span>
              </Link>
              <Link href="https://facebook.com" style={iconLink}>
                <span style={iconCircle}>f</span>
              </Link>
            </div>

            {/* Céginfó */}
            <Text style={footerText}>
              Ha kérdésed van, egyszerűen válaszolj erre az üzenetre, és
              hamarosan felvesszük veled a kapcsolatot 🙌 YourLove Kft. – 1111 Budapest, Szerelem
              utca 12.
            </Text>

            {/* Leiratkozás */}
            {/*<Link href="https://yourlove.hu/unsubscribe" style={unsubscribeLink}>
              Leiratkozás
            </Link>*/}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* --- STÍLUSOK --- */

const main = {
  backgroundColor: "#f5f5f5",   // --grey-bg
  padding: "20px",
};

const container = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "12px",
  fontFamily: "Arial, sans-serif",
};

const h1 = {
  color: "#b60c3f",             // --pink
  fontSize: "20px",
  marginBottom: "12px",
  textAlign: "center",
};

const h2 = {
  fontSize: "16px",
  marginBottom: "8px",
  color: "#111111",             // --black
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#484848",              // --secondary-text
};

const infoSection = {
  marginTop: "10px",
  marginBottom: "10px",
};

const labelRow = {
  fontSize: "13px",
  color: "#767676",              // --tertiary-text
  display: "flex",
  justifyContent: "space-between",
};

const box = {
  marginTop: "20px",
  marginBottom: "20px",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px",
  padding: "4px 0",
  color: "#111111",              // --black
};

/* --- FOOTER --- */

const footerSection = {
  marginTop: "28px",
  paddingTop: "24px",
  borderTop: "1px solid #dfdfdf", // --border
  textAlign: "center",
};

const socialRow = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginBottom: "12px",
};

const iconLink = {
  textDecoration: "none",
};

const iconCircle = {
  width: "32px",
  height: "32px",
  borderRadius: "9999px",
  backgroundColor: "#111111",    // --black
  color: "#ffffff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "14px",
  fontWeight: "bold",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#767676",              // --tertiary-text
  marginBottom: "10px",
};

const unsubscribeLink = {
  fontSize: "12px",
  color: "#767676",
  textDecoration: "underline",
};
