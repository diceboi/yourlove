import { TbDiscount } from "react-icons/tb";
import H3 from "./UI/Texts/H3";
import ProductList from "./UI/ProductList";
import { createClient } from "@/utils/supabase/server";

export default async function SaleProducts() {
  const supabase = await createClient();
  
  // Query products that have a sale price
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .not("akcios_ar_brutto", "is", null) // Filter for products with sale price
    .gt("akcios_ar_brutto", 0)           // Ensure it's greater than 0
    .eq("kozzeteve", true)               // Must be published
    .limit(8);

  // If no sales, hide the section
  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full py-16 px-4 xl:px-12 bg-white">
      <div className="flex flex-nowrap items-center gap-4">
        <TbDiscount className="text-[var(--pink)] w-10 h-10" />
        <H3>Akciós termékek</H3>
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
