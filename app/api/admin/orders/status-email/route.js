// app/api/admin/orders/status-email/route.js

import { Resend } from "resend";
import OrderStatusEmail from "@/emails/OrderStatusEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, order_number, status, email, name } = body || {};

    if (!email || !order_number || !status) {
      return new Response(
        JSON.stringify({ ok: false, error: "Hiányzó adatok az e-mail küldéshez." }),
        { status: 400 }
      );
    }

    const displayName =
      name && name.trim().length > 0 ? name : "Kedves Vásárló";

    await resend.emails.send({
      from: "YourLove <info@yourlove.hu>",
      to: email,
      subject: `Rendelés státusz frissítve – #${order_number}`,
      react: OrderStatusEmail({
        name: displayName,
        orderId: order_number,
        status,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Status email send error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Nem sikerült elküldeni a státusz e-mailt.",
      }),
      { status: 500 }
    );
  }
}
