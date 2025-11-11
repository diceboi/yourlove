import { NextResponse } from "next/server";
import { requireUser } from "../api/_utils/auth";

export async function GET() {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  // 1) Orders userhez
  const { data: orders, error: oErr } = await supabase
    .from("orders")
    .select("id, number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 400 });
  if (!orders?.length) return NextResponse.json([]);

  const orderIds = orders.map(o => o.id);

  // 2) Items részletekkel a view-ból
  const { data: items, error: iErr } = await supabase
    .from("order_items_detailed")
    .select("*")
    .in("order_id", orderIds);

  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 400 });

  // 3) összerakjuk
  const byOrder = new Map();
  for (const o of orders) byOrder.set(o.id, { ...o, items: [] });

  for (const it of items || []) {
    byOrder.get(it.order_id)?.items.push({
      id: it.id,
      productId: it.product_id,
      name: it.product_name,
      image: it.product_image,
      qty: it.qty,
      unit_price: it.unit_price,
      vat_rate: it.vat_rate,
    });
  }

  return NextResponse.json([...byOrder.values()]);
}
