import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/app/api/_utils/auth";

// GET - Fetch single announcement
export async function GET(req, { params }) {
  const { user, supabase, resp } = await requireUser();
  if (resp) return resp;

  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ announcement: data });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

// PATCH - Update announcement
export async function PATCH(req, { params }) {
  const { user, supabase, resp } = await requireUser();
  if (resp) return resp;

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      content,
      link_url,
      bg_color,
      text_color,
      display_order,
      published,
    } = body;

    const updateData = {};
    if (content !== undefined) updateData.content = content.trim();
    if (link_url !== undefined) updateData.link_url = link_url || null;
    if (bg_color !== undefined) updateData.bg_color = bg_color;
    if (text_color !== undefined) updateData.text_color = text_color;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (published !== undefined) updateData.published = published;

    const { data, error } = await supabase
      .from("announcements")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ announcement: data });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement
export async function DELETE(req, { params }) {
  const { user, supabase, resp } = await requireUser();
  if (resp) return resp;

  try {
    const { id } = await params;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
