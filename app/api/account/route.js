// /app/api/account/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function getUserAndClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, supabase, error: error || new Error("No session"), resp: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, supabase };
}

export async function GET() {
  const { user, supabase, resp } = await getUserAndClient();
  if (!user) return resp;

  // próbáld id alapján (RLS ehhez van belőve)
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // fallback a metadatára, ha még nincs sor a táblában
  const meta = user.user_metadata || {};
  const fullName = meta.name || meta.full_name || "";
  const [firstFromName = "", ...rest] = fullName.split(" ").filter(Boolean);
  const lastFromName = rest.join(" ");

  const out = {
    id: user.id,
    email: user.email,
    firstname: profile?.firstname ?? firstFromName ?? "",
    lastname:  profile?.lastname  ?? lastFromName  ?? "",
    phone:     profile?.phone     ?? "",
  };

  return NextResponse.json(out);
}

export async function PUT(req) {
  const { user, supabase, resp } = await getUserAndClient();
  if (!user) return resp;

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const row = {
    id: user.id,
    email: user.email,                 // mindig felülírjuk a saját emaillel
    firstname: body.firstname ?? null,
    lastname:  body.lastname  ?? null,
    phone:     body.phone     ?? null,
    updated_at: new Date().toISOString(),
  };

  // upsert id alapján (RLS: insert/update saját id-re engedélyezett)
  const { error } = await supabase
    .from("user_profiles")
    .upsert(row, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
