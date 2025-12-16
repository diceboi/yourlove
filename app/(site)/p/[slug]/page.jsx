import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import CustomPageTemplate from "@/app/components/CustomPageTemplate"

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: page } = await supabase
    .from("custom_pages")
    .select("cim, meta_title, meta_leiras, fokep")
    .eq("slug", slug)
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
    openGraph: {
      title: page.meta_title || page.cim,
      description: page.meta_leiras || "",
      images: page.fokep ? [page.fokep] : [],
    },
  }
}

export default async function CustomPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: page, error } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", slug)
    .eq("kozzeteve", true)
    .single()

  if (error || !page) {
    notFound()
  }

  return <CustomPageTemplate page={page} />
}
