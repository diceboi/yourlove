import { TbBasketPlus } from "react-icons/tb";
import H3 from "./UI/Texts/H3";
import SecondaryProductList from "@/app/components/UI/SecondaryProductList";
import { createClient } from "@/utils/supabase/server";

export default async function RecommendedProducts() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("kattintasok", { ascending: false })
    .limit(8);
    
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-nowrap items-center gap-4">
        {/*<TbBasketPlus className="text-[var(--pink)] w-10 h-10" />*/}
        <H3>Tökéletes párosítás</H3>
      </div>
      <SecondaryProductList
        products={products}
        slidesPerView640={1.5}
        slidesPerView768={2.5}
        slidesPerView1024={3}
        slidesPerView1280={4}
        slidesPerView1600={5}
      />
    </div>
  );
}
