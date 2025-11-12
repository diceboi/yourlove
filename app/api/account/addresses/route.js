// /app/api/account/addresses/route.js
import { NextResponse } from "next/server";
import { requireUser } from "../../_utils/auth";

// GET: összes cím a userhez
export async function GET() {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // front-end forma
  const out = (data || []).map((a) => ({
    id: a.id,
    nev: a.label || "Cím",
    vezeteknev: a.lastname || "",
    keresztnev: a.firstname || "",
    orszag: a.country || "Magyarország",
    irsz: a.zip || "",
    varos: a.city || "",
    utca: a.line1 || "",
    telefon: a.phone || "",
    default: !!a.is_default,
  }));

  return NextResponse.json(out);
}

// POST: upsert 1 címet (egyszerűsítve)
export async function POST(req) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const body = await req.json();

  // ha default érkezik true-val, előbb lenullázzuk a többin
  if (body.is_default === true) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const row = {
    user_id: user.id,
    label: body.label || "Új cím",
    firstname: body.firstname || null,
    lastname: body.lastname || null,
    country: body.country || "Magyarország",
    zip: body.zip || null,
    city: body.city || null,
    line1: body.line1 || null,
    phone: body.phone || null,
    is_default: !!body.is_default,
  };

  const { error } = await supabase.from("user_addresses").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
