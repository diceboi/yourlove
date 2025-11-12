import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user || null;

  if (error || !user) {
    return {
      user: null,
      supabase,
      resp: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, supabase, resp: null };
}
