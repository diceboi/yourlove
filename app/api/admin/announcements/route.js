import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/app/api/_utils/auth";

// GET - Fetch all announcements (for admin)
export async function GET() {
  const { user, supabase, resp } = await requireUser();
  if (resp) return resp;

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ announcements: data || [] });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST - Create new announcement
export async function POST(req) {
  const { user, supabase, resp } = await requireUser();
  if (resp) return resp;

  try {
    const body = await req.json();
    const {
      content,
      link_url,
      bg_color,
      text_color,
      display_order,
      published,
    } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert([
        {
          content: content.trim(),
          link_url: link_url || null,
          bg_color: bg_color || "var(--black)",
          text_color: text_color || "white",
          display_order: display_order || 0,
          published: published || false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ announcement: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
