import { TbFlameFilled } from "react-icons/tb";
import H3 from "./UI/Texts/H3";
import ProductList from "./UI/ProductList";
import { createClient } from "@/utils/supabase/server";

export default async function PopularProducts() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("kozzeteve", true)
    .order("kattintasok", { ascending: false })
    .limit(8);
    
  return (
    <div className="flex flex-col gap-4 w-full py-16 px-4 xl:px-12">
      <div className="flex flex-nowrap items-center gap-4">
        <TbFlameFilled className="text-[var(--pink)] w-10 h-10" />
        <H3>Népszerű termékek</H3>
      </div>
      <ProductList
        products={products}
        slidesPerView640={1.5}
        slidesPerView768={3.5}
        slidesPerView1024={4}
        slidesPerView1280={4}
        slidesPerView1440={5}
      />
    </div>
  );
}
