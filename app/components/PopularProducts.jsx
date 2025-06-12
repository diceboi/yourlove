import { TbFlameFilled } from "react-icons/tb";
import H3 from "./UI/Texts/H3";
import ProductList from "./UI/ProductList";

export default function PopularProducts() {
  return (
    <div className="flex flex-col gap-4 w-full py-16 px-4 xl:px-12">
      <div className="flex flex-nowrap items-center gap-4">
        <TbFlameFilled className="text-[var(--pink)] w-10 h-10" />
        <H3>Népszerű termékek</H3>
      </div>
      <ProductList slidesPerView640={1.5} slidesPerView768={2.5} slidesPerView1024={3} slidesPerView1280={4}/>
    </div>
  );
}
