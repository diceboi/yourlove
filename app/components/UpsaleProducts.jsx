import { TbShoppingCartPlus } from "react-icons/tb";
import H3 from "./UI/Texts/H3";
import H4 from "./UI/Texts/H4";
import ProductList from "./UI/ProductList";
import Paragraph from "./UI/Texts/Paragraph";

export default function UpsaleProducts() {
  return (
    <div id="upsale" className="flex flex-col gap-4 w-full">
      <div className="flex flex-nowrap items-center gap-4">
        <TbShoppingCartPlus className="text-[var(--pink)] w-10 h-10" />
        <div className="flex flex-col gap-2">
          <H3>Dobj még valamit a kosárba!</H3>
        </div>
      </div>
      <ProductList slidesPerView640={1.5} slidesPerView768={2.5} slidesPerView1024={3} slidesPerView1280={3} />
    </div>
  );
}
