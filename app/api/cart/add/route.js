// /app/api/cart/add/route.js
import { NextResponse } from "next/server";
import { requireUser } from "../../_utils/auth";

export async function POST(req) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const body = await req.json();
  const productId = body.product_id;
  const qty = Math.max(1, parseInt(body.qty || 1, 10));

  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  // 1) keresünk nyitott kosarat (ha nincs status mező, hagyd ki a where-t és hozz létre egyet)
  let { data: carts, error: e1 } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "open")
    .limit(1);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  let cartId = carts?.[0]?.id;
  if (!cartId) {
    const { data: inserted, error: e2 } = await supabase
      .from("carts")
      .insert({ user_id: user.id, status: "open" })
      .select("id")
      .single();
    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });
    cartId = inserted.id;
  }

  // 2) cart_items: ha van ilyen product a kosárban, növeljük; különben beszúrjuk
  const { data: existing, error: e3 } = await supabase
    .from("cart_items")
    .select("id, qty")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (e3) return NextResponse.json({ error: e3.message }, { status: 400 });

  if (existing) {
    const { error: e4 } = await supabase
      .from("cart_items")
      .update({ qty: (existing.qty || 0) + qty })
      .eq("id", existing.id);
    if (e4) return NextResponse.json({ error: e4.message }, { status: 400 });
  } else {
    const { error: e5 } = await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, qty });
    if (e5) return NextResponse.json({ error: e5.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
