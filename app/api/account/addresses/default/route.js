// app/api/account/addresses/default/route.js
import { NextResponse } from "next/server";
import { requireUser } from "@/app/api/_utils/auth";

export async function POST(req) {
  const { user, supabase, resp } = await requireUser();
  if (!user) return resp;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok:false, error:'missing id' }, { status: 400 });

  // Mindet lekapcsoljuk
  const off = await supabase
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', user.id);

  if (off.error) return NextResponse.json({ ok:false, error: off.error.message }, { status: 400 });

  // Ezt felkapcsoljuk
  const on = await supabase
    .from('user_addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (on.error) return NextResponse.json({ ok:false, error: on.error.message }, { status: 400 });

  return NextResponse.json({ ok:true });
}
