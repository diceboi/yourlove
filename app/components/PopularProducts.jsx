import { TbFlame } from "react-icons/tb";
import H2 from "./UI/H2";
import ProductList from "./UI/ProductList";

export default function PopularProducts() {
  return (
    <div className="w-full xl:py-8 py-4">
      <div className="flex flex-nowrap gap-4">
        <TbFlame className="text-[var(--pink)] w-10 h-10" />
        <H2>Népszerű termékek</H2>
      </div>
      <ProductList />
    </div>
  );
}
