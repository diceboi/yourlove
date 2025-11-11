import { NextResponse } from "next/server";
import { requireUser } from "../_utils/auth";

export async function GET() {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    ...data
  });
}

export async function PUT(req) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const body = await req.json();
  const row = {
    id: user.id,
    firstname: body.firstname ?? null,
    lastname:  body.lastname ?? null,
    phone:     body.phone ?? null,
    email:     user.email,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_profiles")
    .upsert(row, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
