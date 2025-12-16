import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import PublicBlockRenderer from "@/app/components/admin/PageBuilder/PublicBlockRenderer"

function parseBlocks(value) {
  if (!value) return []
  try {
    if (typeof value === 'string') {
      return JSON.parse(value)
    }
    if (Array.isArray(value)) return value
  } catch (e) {
    console.error('Failed to parse blocks:', e)
  }
  return []
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug
  
  const supabase = await createClient()
  const { data: page } = await supabase
    .from("custom_pages")
    .select("cim, meta_title, meta_leiras")
    .eq("slug", slugPath)
    .eq("kozzeteve", true)
    .single()

  if (!page) {
    return {
      title: "Oldal nem található",
    }
  }

  return {
    title: page.meta_title || page.cim || "YourLove",
    description: page.meta_leiras || "",
  }
}

export default async function CustomPage({ params }) {
  const { slug } = await params
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug
  
  const supabase = await createClient()
  const { data: page, error } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", slugPath)
    .eq("kozzeteve", true)
    .single()

  if (error || !page) {
    notFound()
  }

  const blocks = parseBlocks(page.tartalom)

  return (
    <div className="w-full">
      <PublicBlockRenderer blocks={blocks} />
    </div>
  )
}
