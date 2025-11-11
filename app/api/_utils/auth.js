import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, supabase, resp: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, supabase };
}
