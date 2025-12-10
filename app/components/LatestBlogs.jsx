import { TbNews } from "react-icons/tb";
import H3 from "./UI/Texts/H3";
import { createClient } from "@/utils/supabase/server";
import BlogTile from "./BlogTile";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";

export default async function LatestBlogs() {
  const supabase = await createClient();
  
  const { data: posts, error } = await supabase
    .from("blogs") 
    .select("*")
    .eq("kozzeteve", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (!posts || posts.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 w-full py-16 px-4 xl:px-12 bg-gray-50">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-nowrap items-center gap-4">
          <TbNews className="text-[var(--pink)] w-10 h-10" />
          <H3>Legfrissebb írásaink</H3>
        </div>
        <Link href="/blog" className="flex items-center gap-2 text-[var(--pink)] font-medium hover:underline">
          Összes cikk <TbArrowRight />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <BlogTile key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
