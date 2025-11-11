import { NextResponse } from "next/server";
import { requireUser } from "../../_utils/auth";

async function getOrCreateCart(supabase, userId) {
  // keresünk egy nyitott cart-ot (állapot mező nálad lehet más; ha nincs, a legutóbbit használjuk)
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!cart) {
    const { data, error } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) throw error;
    cart = data;
  }
  return cart.id;
}

export async function POST(req) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const { product_id, qty = 1 } = await req.json();
  if (!product_id) return NextResponse.json({ error: "product_id required" }, { status: 400 });

  // 1) cart id
  const cartId = await getOrCreateCart(supabase, user.id);

  // 2) termék árazás (unit_price, vat_rate) – a te táblád alapján
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, unit_price, vat_rate")
    .eq("id", product_id)
    .maybeSingle();
  if (pErr || !product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // 3) ha már a kosárban van, növeljük a qty-t
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, qty")
    .eq("cart_id", cartId)
    .eq("product_id", product_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ qty: existing.qty + Number(qty || 1) })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cartId,
        product_id,
        qty: Number(qty || 1),
        unit_price: product.unit_price, // a te sémád szerint
        vat_rate: product.vat_rate ?? 27,
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, cart_id: cartId });
}
