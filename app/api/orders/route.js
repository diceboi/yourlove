// /app/api/orders/route.js
import { NextResponse } from "next/server";
import { requireUser } from "@/app/api/_utils/auth";

export async function GET() {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  // Orders (minimál mezők: id, user_id, created_at, status, total_huf vagy számoljuk sorokból)
  const { data: orders, error: e1 } = await supabase
    .from("orders")
    .select("id, created_at, status, order_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  // Order items join products: name + ár
  const { data: items, error: e2 } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, qty, unit_price_huf, products:product_id (fo_cim)")
    .in(
      "order_id",
      (orders || []).map((o) => o.id).length ? orders.map((o) => o.id) : ["00000000-0000-0000-0000-000000000000"]
    );

  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });

  const byOrder = new Map();
  (orders || []).forEach((o) => {
    byOrder.set(o.id, {
      id: o.id,
      number: o.number || o.id,     // ha nincs number, mutatjuk az id-t
      order_number: o.order_number,
      created_at: o.created_at,
      status: o.status || "processing",
      items: [],
    });
  });

  (items || []).forEach((it) => {
    const bucket = byOrder.get(it.order_id);
    if (!bucket) return;
    bucket.items.push({
      id: it.id,
      productId: it.product_id,
      name: it.products?.fo_cim || "Termék",
      qty: it.qty || 1,
      unit_price: it.unit_price_huf || 0,
    });
  });

  // total számolás
  const out = Array.from(byOrder.values()).map((o) => ({
    ...o,
    total:
      o.items.reduce((s, it) => s + (it.qty || 0) * (it.unit_price || 0), 0) || 0,
  }));

  return NextResponse.json(out);
}
