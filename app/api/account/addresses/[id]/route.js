// app/api/account/addresses/[id]/route.js
import { NextResponse } from "next/server";
import { requireUser } from "@/app/api/_utils/auth";

export async function PUT(req, { params }) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const id = params.id;
  const body = await req.json();

  const { error } = await supabase
    .from('user_addresses')
    .update({
      label: body.label ?? null,
      firstname: body.firstname ?? null,
      lastname: body.lastname ?? null,
      country: body.country ?? null,
      zip: body.zip ?? null,
      city: body.city ?? null,
      line1: body.line1 ?? null,
      phone: body.phone ?? null,
    })
    .eq('id', id)
    .eq('user_id', user.id); // RLS-safe

  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok:true });
}

export async function DELETE(_req, { params }) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const id = params.id;

  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok:true });
}
