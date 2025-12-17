import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Fetch published announcements (public endpoint)
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("announcements")
      .select("id, content, link_url, bg_color, text_color, display_order")
      .eq("published", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ announcements: data || [] });
  } catch (error) {
    console.error("Error fetching published announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
